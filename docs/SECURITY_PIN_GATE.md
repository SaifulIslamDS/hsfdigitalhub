# HSF Knowledge Hub — 6-Digit PIN Security Setup

## What this build adds

This build protects the full Netlify site with a Netlify Edge Function.

The protection applies to:
- the homepage;
- all six master documents;
- direct HTML URLs;
- local images and mockups;
- other local site assets.

The PIN is not stored in HTML, JavaScript, GitHub, or this ZIP.

A successful PIN entry creates a signed, `HttpOnly`, `Secure`, `SameSite=Strict` session cookie. The session expires after 12 hours.

The PIN endpoint is limited to 5 requests per 60 seconds for each client IP/domain by Netlify's code-based rate limiting.

This is a shared-PIN private-review layer. It is not intended to protect confidential patient, student, HR, payroll, safeguarding, or other sensitive personal records.

---

## 1. Required Netlify environment variables

Two runtime environment variables are required:

### `HSF_ACCESS_PIN`

Value:
- exactly 6 numeric digits;
- an unpredictable value should be selected;
- common values such as `123456`, `000000`, dates, phone fragments, or repeated digits should be avoided.

The value should contain six digits only. No default PIN is supplied in this package.

### `HSF_ACCESS_SECRET`

A separate random secret of at least 32 characters is required.

It should never be the PIN.

A strong secret can be generated in Windows PowerShell:

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
$rng.Dispose()
```

The resulting Base64 text can be copied into `HSF_ACCESS_SECRET`.

---

## 2. Netlify configuration

In the Netlify project:

**Project configuration → Environment variables**

The following variables should be added:

| Key | Value |
|---|---|
| `HSF_ACCESS_PIN` | Your private 6-digit PIN |
| `HSF_ACCESS_SECRET` | The random secret generated above |

If Netlify shows variable scopes, the **Functions** scope must be included because Edge Functions read runtime environment variables from the Functions scope.

The PIN and secret should not be added to `netlify.toml`.

---

## 3. Redeployment

After either environment variable is added or changed, a new deploy is required.

Netlify applies Edge Function environment-variable changes at deployment time.

A production deploy may be triggered from:

**Deploys → Trigger deploy → Deploy site**

---

## 4. Expected behavior

### First visit

A visitor should see a compact HSF-branded access card containing the HSF logo, Knowledge Hub title, a short protected-resource note, and the 6-digit PIN field.

No site document should be visible before a valid PIN is entered.

### Correct PIN

A successful PIN entry should:
1. set a secure 12-hour session cookie;
2. redirect the visitor to the originally requested page;
3. allow direct navigation to other protected pages and assets.

### Incorrect PIN

A friendly error should be shown.

Repeated requests to the PIN endpoint are rate-limited by Netlify.

### Missing configuration

If the PIN or session secret is missing or invalid, the site intentionally fails closed and returns an access-configuration message instead of exposing the site.

### Sign out

After access is granted, a small **Protected · Sign out** control appears at the lower-left of each main HTML page.

Signing out deletes the session cookie and returns the visitor to the protected entry screen.

---

## 5. Files responsible for the security layer

```text
netlify/
└── edge-functions/
    ├── pin-gate.ts
    ├── pin-login.ts
    └── pin-logout.ts
```

### `pin-gate.ts`
Protects the entire site and verifies the signed session cookie.

### `pin-login.ts`
Processes the PIN form and applies Netlify rate limiting.

### `pin-logout.ts`
Deletes the session cookie.

Security helpers are intentionally embedded inside the deployable handler files. This avoids placing a non-handler TypeScript module in Netlify's configured Edge Functions directory, where Netlify would otherwise try to package it as an Edge Function.

---

## 6. Important security notes

- The PIN should be shared only with intended reviewers.
- The PIN should be changed when it is believed to have been shared outside the intended group.
- `HSF_ACCESS_SECRET` should not be shared with normal site reviewers.
- A new random `HSF_ACCESS_SECRET` immediately invalidates all previously issued sessions after a redeploy.
- The site's existing `noindex` / `nofollow` protection remains enabled.
- Authenticated pages and assets are returned with `Cache-Control: private, no-store`.
- The login page uses a restrictive Content Security Policy and does not load external scripts, fonts, or images.
- A six-digit shared PIN has a limited key space. The rate limit reduces ordinary online guessing, but this remains a lightweight review barrier rather than enterprise authentication.

---

## 7. PIN rotation

For a normal PIN change:

1. `HSF_ACCESS_PIN` may be changed in Netlify.
2. A new production deploy is required.

Existing signed sessions continue until they expire because the session signature uses `HSF_ACCESS_SECRET`.

For an immediate full access reset:

1. `HSF_ACCESS_PIN` should be changed.
2. `HSF_ACCESS_SECRET` should also be replaced with a new random value.
3. A new production deploy should be created.

Changing the session secret invalidates existing session cookies.

---

## 8. Quick acceptance test after deployment

The following checks should be completed in an incognito/private browser window:

1. The homepage should show the PIN screen.
2. A direct master-document URL should also show the PIN screen.
3. A direct local image URL should not be viewable without the PIN.
4. A wrong PIN should show an error.
5. The correct PIN should open the requested page.
6. Refreshing the page should keep the authorized session active.
7. Another master document should open without asking for the PIN again.
8. **Protected · Sign out** should end the session.
9. After sign-out, a protected page should require the PIN again.
10. The deploy log should be checked for confirmation that Netlify accepted the rate-limit rule.

---

## 9. Local development

Netlify Edge Functions are not executed by a normal static file server.

When local testing is needed, the Netlify CLI should be used:

```powershell
netlify dev
```

The two environment variables must also be available to the local Netlify development environment.

For production, the Netlify UI remains the recommended place for the real PIN and session secret.


## Build compatibility note

The `netlify/edge-functions` directory intentionally contains only deployable Edge Function handlers with a default function export.

Shared security helper code is embedded in the relevant handlers instead of being stored as a separate `.ts` file inside this directory. Netlify treats JavaScript and TypeScript files in its Edge Functions directory as function files during bundling, and every deployable Edge Function file requires a default handler export.

## PIN visibility

The eye control inside the PIN field allows the six entered digits to be shown or hidden. The PIN is still submitted only through the authorized access form and verified by the Netlify Edge Function.
