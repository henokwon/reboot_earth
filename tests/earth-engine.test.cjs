const { test, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const keys = ["EARTH_ENGINE_PROJECT", "EARTH_ENGINE_SERVICE_ACCOUNT_CLIENT_EMAIL", "EARTH_ENGINE_SERVICE_ACCOUNT_PRIVATE_KEY"];
const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
afterEach(() => {
  for (const key of keys) {
    if (original[key] === undefined) delete process.env[key];
    else process.env[key] = original[key];
  }
});

function load(sdk) {
  const filename = path.resolve(__dirname, "../src/lib/earth-engine.ts");
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const loaded = new Module(filename, module);
  loaded.require = (specifier) => {
    if (specifier === "server-only") return {};
    if (specifier === "@google/earthengine") return sdk;
    throw new Error("Unexpected test dependency");
  };
  loaded._compile(compiled, filename);
  return loaded.exports.getEarthEngine;
}
function credentials() {
  process.env.EARTH_ENGINE_PROJECT = "test-project";
  process.env.EARTH_ENGINE_SERVICE_ACCOUNT_CLIENT_EMAIL = "test@example.test";
  process.env.EARTH_ENGINE_SERVICE_ACCOUNT_PRIVATE_KEY = "dummy-line-1\\ndummy-line-2";
}

test("missing server credentials fail before contacting the provider", async () => {
  for (const key of keys) delete process.env[key];
  let calls = 0;
  const getEarthEngine = load({ data: { authenticateViaPrivateKey() { calls++; } } });
  await assert.rejects(getEarthEngine, /not configured/);
  assert.equal(calls, 0);
});

test("concurrent requests share initialization and decode escaped key newlines", async () => {
  credentials();
  let authCalls = 0, initializeCalls = 0;
  const sdk = {
    data: { authenticateViaPrivateKey(key, success) {
      authCalls++;
      assert.equal(key.client_email, "test@example.test");
      assert.equal(key.private_key, "dummy-line-1\ndummy-line-2");
      setImmediate(success);
    } },
    initialize(base, tile, success, failure, xsrf, project) {
      initializeCalls++;
      assert.equal(project, "test-project");
      setImmediate(success);
    },
  };
  const getEarthEngine = load(sdk);
  const result = await Promise.all([getEarthEngine(), getEarthEngine(), getEarthEngine()]);
  assert.ok(result.every((value) => value === sdk));
  assert.equal(authCalls, 1);
  assert.equal(initializeCalls, 1);
});

test("authentication failures are redacted and can be retried", async () => {
  credentials();
  let calls = 0;
  const sdk = { data: { authenticateViaPrivateKey(key, success, failure) {
    calls++;
    failure(new Error("provider message containing dummy-line-1"));
  } } };
  const getEarthEngine = load(sdk);
  for (let i = 0; i < 2; i++) {
    await assert.rejects(getEarthEngine, (error) => {
      assert.equal(error.message, "Earth Engine authentication failed");
      assert.equal(error.message.includes("dummy-line-1"), false);
      return true;
    });
  }
  assert.equal(calls, 2);
});
