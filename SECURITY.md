# Credential incident and deployment

The previous public `.env` contained a service-account private key. Removing it
from the checkout does **not** revoke it or remove it from existing history,
forks, caches or clones.

Before deploying:

1. Disable/delete the exposed key in the owning Google Cloud project's service
   account key settings and review access/audit logs. Its current validity has
   not been tested by this remediation.
2. After revocation, create a replacement with the minimum required permissions
   and store it in server-side deployment secrets.
3. Copy `.env.example` to ignored `.env.local` for development. Supply the project
   ID, service-account email and replacement key. Escaped `\n` sequences are
   converted to newlines on the server.
4. Coordinate history cleanup with collaborators. History is not rewritten by
   this patch; revocation is required regardless of any future history cleanup.

`src/lib/earth-engine.ts` uses `server-only`. Never import credentials into client
components or use `NEXT_PUBLIC_` names for secrets. Configuration failures produce
a generic public error without exposing provider details.
