# HSF Knowledge Hub v1.3.2

## 30-minute inactivity sign-out

This release adds a sliding inactivity timeout to the protected HSF Knowledge Hub without changing the six-document content architecture, page design, navigation, or PIN itself.

### Netlify environment variable

```text
HSF_IDLE_TIMEOUT_MINUTES=30
```

- If the variable is not set, the default is **30 minutes**.
- Valid values are whole minutes from **1 to 720**.
- The existing **12-hour absolute session limit** remains the hard maximum.
- Changing the variable changes the inactivity window without another code change; Netlify should be redeployed after an environment-variable change.

### How it works

- Successful PIN login still creates the existing signed 12-hour authorization cookie.
- Login now also creates a signed, `HttpOnly`, `Secure`, `SameSite=Strict` idle-session cookie.
- Authorized HTML pages receive a small inactivity guard from the existing Netlify Edge gate.
- Keyboard, pointer/touch, scrolling, mouse movement, focus, and cross-tab activity refresh the idle window.
- Activity refresh is throttled and sent to the protected `/__hsf_activity` Edge route.
- After the configured inactivity window, the browser is redirected through the existing logout endpoint and the authorization cookies are removed.
- The server-side idle cookie also expires, so an inactive session cannot be recovered simply by navigating to another protected page.

### Deployment note

Existing v1.3.1 browser sessions do not contain the new idle cookie. After v1.3.2 is deployed, currently authorized browsers may be asked to enter the PIN once. Subsequent sessions use the new inactivity control.

### Files changed

```text
netlify/edge-functions/pin-gate.ts
netlify/edge-functions/pin-login.ts
netlify/edge-functions/pin-logout.ts
docs/SECURITY_PIN_GATE.md
docs/DEPLOY_TO_NETLIFY.md
docs/RELEASE_v1.3.2.md
docs/APPLY_v1.3.2.md
```

No master-document HTML, social communication architecture, brand system, ERP documentation, or Netlify header/redirect configuration is changed by this patch.
