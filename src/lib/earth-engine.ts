import "server-only";
import ee from "@google/earthengine";

let initialization: Promise<void> | undefined;

export async function getEarthEngine() {
  if (!initialization) {
    initialization = new Promise<void>((resolve, reject) => {
      const project = process.env.EARTH_ENGINE_PROJECT;
      const clientEmail = process.env.EARTH_ENGINE_SERVICE_ACCOUNT_CLIENT_EMAIL;
      const privateKey = process.env.EARTH_ENGINE_SERVICE_ACCOUNT_PRIVATE_KEY;
      if (!project || !clientEmail || !privateKey) {
        reject(new Error("Earth Engine server credentials are not configured"));
        return;
      }
      ee.data.authenticateViaPrivateKey(
        { client_email: clientEmail, private_key: privateKey.replace(/\\n/g, "\n") },
        () => ee.initialize(null, null, resolve,
          () => reject(new Error("Earth Engine initialization failed")), null, project),
        () => reject(new Error("Earth Engine authentication failed")),
      );
    }).catch((error) => {
      initialization = undefined;
      throw error;
    });
  }
  await initialization;
  return ee;
}
