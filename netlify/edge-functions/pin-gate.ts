
const COOKIE_NAME = "hsf_access_v1";
const SESSION_SECONDS = 12 * 60 * 60;
const encoder = new TextEncoder();

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
    const binary = atob(padded);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

async function sha256(value) {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", encoder.encode(value)),
  );
}

function constantTimeEqual(a, b) {
  if (!(a instanceof Uint8Array) || !(b instanceof Uint8Array)) return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function importHmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function hmacSign(secret, value) {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

async function hmacVerify(secret, value, encodedSignature) {
  const signature = base64UrlToBytes(encodedSignature);
  if (!signature) return false;
  try {
    const key = await importHmacKey(secret);
    return await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      encoder.encode(value),
    );
  } catch {
    return false;
  }
}

function readSecurityConfig() {
  const pin = Netlify.env.get("HSF_ACCESS_PIN") ?? "";
  const secret = Netlify.env.get("HSF_ACCESS_SECRET") ?? "";

  if (!/^\d{6}$/.test(pin)) {
    return {
      ok: false,
      message:
        "The site owner needs to configure HSF_ACCESS_PIN as exactly six numeric digits in Netlify Environment variables.",
    };
  }

  if (secret.length < 32) {
    return {
      ok: false,
      message:
        "The site owner needs to configure HSF_ACCESS_SECRET with a random value of at least 32 characters in Netlify Environment variables.",
    };
  }

  if (secret === pin) {
    return {
      ok: false,
      message: "HSF_ACCESS_SECRET must be different from HSF_ACCESS_PIN.",
    };
  }

  return { ok: true, pin, secret };
}

async function pinMatches(submittedPin, configuredPin) {
  if (!/^\d{6}$/.test(submittedPin)) return false;
  const [submittedHash, configuredHash] = await Promise.all([
    sha256(submittedPin),
    sha256(configuredPin),
  ]);
  return constantTimeEqual(submittedHash, configuredHash);
}

async function createSessionValue(secret) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `hsf-access-v1:${expiresAt}`;
  const signature = await hmacSign(secret, payload);
  return { value: `${expiresAt}.${signature}`, expiresAt };
}

async function verifySessionValue(value, secret) {
  if (!value) return false;
  const match = /^(\d{10})\.([A-Za-z0-9_-]+)$/.exec(value);
  if (!match) return false;

  const expiresAt = Number(match[1]);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(expiresAt) || expiresAt <= now) return false;
  if (expiresAt > now + SESSION_SECONDS + 300) return false;

  return hmacVerify(secret, `hsf-access-v1:${expiresAt}`, match[2]);
}

function safeReturnTo(rawValue) {
  if (!rawValue || typeof rawValue !== "string") return "/";
  let value = rawValue.trim();

  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  if (value.startsWith("/__hsf_access") || value.startsWith("/__hsf_logout")) {
    return "/";
  }

  value = value.replace(/[\u0000-\u001F\u007F]/g, "");
  return value || "/";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function securityHeaders(extra = {}) {
  return {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "private, no-store, max-age=0",
    "pragma": "no-cache",
    "expires": "0",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "no-referrer",
    "x-robots-tag": "noindex, nofollow, noarchive, nosnippet",
    "content-security-policy":
      "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    ...extra,
  };
}

function protectedResponseHeaders(sourceHeaders) {
  const headers = new Headers(sourceHeaders);
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "no-referrer");
  return headers;
}

function renderAccessPage({
  returnTo = "/",
  error = "",
  configurationError = "",
} = {}) {
  const hasError = Boolean(error);
  const hasConfigurationError = Boolean(configurationError);
  const safeReturn = escapeHtml(returnTo);

  const errorHtml = hasError
    ? `<div class="alert error" role="alert">${escapeHtml(error)}</div>`
    : "";

  const configurationHtml = hasConfigurationError
    ? `<div class="alert config" role="alert"><strong>Access gate not configured.</strong><br>${escapeHtml(configurationError)}</div>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="robots" content="noindex,nofollow,noarchive,nosnippet">
  <title>Protected Access · HSF Knowledge Hub</title>
  <style>
    :root{color-scheme:light;--green:#008C44;--deep:#006B35;--ink:#173F2A;--muted:#66756C;--soft:#EFF8F3;--line:#D8E9DF;--white:#fff}
    *{box-sizing:border-box}
    html,body{margin:0;min-height:100%;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#F4F8F5;color:var(--ink)}
    body{min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 15% 10%,rgba(0,140,68,.10),transparent 30rem),radial-gradient(circle at 88% 85%,rgba(30,142,137,.09),transparent 30rem),linear-gradient(145deg,#F9FCFA,#EEF7F2)}
    .shell{width:min(100%,970px);display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,.78fr);overflow:hidden;border:1px solid var(--line);border-radius:30px;background:rgba(255,255,255,.96);box-shadow:0 30px 80px rgba(16,62,36,.14)}
    .intro{padding:54px;background:linear-gradient(145deg,#F8FCF9,#EAF7F0);position:relative;min-height:570px}
    .brand{display:flex;align-items:center;gap:14px}
    .mark{width:58px;height:58px;border-radius:18px;background:var(--green);color:#fff;display:grid;place-items:center;font-weight:900;font-size:18px;letter-spacing:.04em;box-shadow:0 10px 24px rgba(0,140,68,.20)}
    .brand small{display:block;text-transform:uppercase;letter-spacing:.16em;font-weight:900;color:var(--green);font-size:10px}
    .brand strong{display:block;margin-top:5px;font-size:15px}
    h1{font-size:42px;line-height:1.08;letter-spacing:-.04em;margin:68px 0 18px;max-width:520px}
    .intro p{font-size:15px;line-height:1.8;color:var(--muted);max-width:520px;margin:0}
    .privacy{margin-top:36px;display:flex;gap:10px;align-items:flex-start;border-top:1px solid rgba(0,140,68,.13);padding-top:20px;color:#50645A;font-size:12px;line-height:1.6}
    .panel{padding:54px 44px;display:flex;flex-direction:column;justify-content:center;background:#fff}
    .eyebrow{text-transform:uppercase;letter-spacing:.16em;font-size:10px;font-weight:900;color:var(--green)}
    h2{font-size:25px;letter-spacing:-.025em;margin:9px 0 9px}
    .hint{font-size:13px;line-height:1.6;color:var(--muted);margin:0 0 24px}
    label{display:block;font-size:12px;font-weight:850;margin-bottom:8px;color:#31483B}
    input{width:100%;height:58px;border:1px solid #CFE1D6;border-radius:15px;padding:0 18px;background:#FAFCFB;color:#163F2A;font-size:22px;letter-spacing:.42em;text-align:center;font-weight:800;outline:none}
    input:focus{border-color:var(--green);box-shadow:0 0 0 4px rgba(0,140,68,.11);background:#fff}
    button{width:100%;height:52px;border:0;border-radius:14px;background:var(--green);color:#fff;font-weight:900;font-size:14px;cursor:pointer;margin-top:15px;box-shadow:0 10px 20px rgba(0,140,68,.18)}
    button:hover{background:var(--deep)}
    .alert{border-radius:13px;padding:12px 14px;font-size:12px;line-height:1.55;margin:0 0 16px}
    .error{background:#FFF2F1;border:1px solid #F4C7C3;color:#8B2D27}
    .config{background:#FFF9DF;border:1px solid #EBD998;color:#705A08}
    .session{margin-top:16px;text-align:center;font-size:11px;line-height:1.55;color:#7A877F}
    .footer{margin-top:28px;text-align:center;font-size:10px;color:#94A099}
    @media(max-width:780px){body{padding:14px}.shell{grid-template-columns:1fr;border-radius:24px}.intro{min-height:auto;padding:34px 30px}h1{font-size:31px;margin-top:44px}.privacy{margin-top:26px}.panel{padding:36px 30px}}
  </style>
</head>
<body>
  <main class="shell">
    <section class="intro">
      <div class="brand">
        <div class="mark" aria-hidden="true">HSF</div>
        <div><small>Human Safety Foundation</small><strong>Digital Transformation Knowledge Hub</strong></div>
      </div>
      <h1>Protected institutional reference resource.</h1>
      <p>This demonstration site contains HSF working frameworks, design references and institutional guidance. Access is intended for authorized HSF reviewers and collaborators.</p>
      <div class="privacy"><span>The PIN is verified by a Netlify Edge Function. It is not stored in the public HTML or client-side JavaScript.</span></div>
    </section>
    <section class="panel">
      <div class="eyebrow">Authorized access</div>
      <h2>Enter the 6-digit PIN</h2>
      <p class="hint">The access session remains valid for up to 12 hours on this browser.</p>
      ${configurationHtml}
      ${errorHtml}
      ${hasConfigurationError ? "" : `
      <form action="/__hsf_access" method="post">
        <input type="hidden" name="return_to" value="${safeReturn}">
        <label for="pin">Access PIN</label>
        <input id="pin" name="pin" type="password" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" minlength="6" autocomplete="one-time-code" autofocus required>
        <button type="submit">Access Knowledge Hub</button>
        <div class="session">Six numeric digits are required. Repeated failed attempts are rate-limited.</div>
      </form>`}
      <div class="footer">Human Safety Foundation (HSF) · Always we are...</div>
    </section>
  </main>
</body>
</html>`;
}

function htmlResponse(html, status = 200, extraHeaders = {}) {
  return new Response(html, { status, headers: securityHeaders(extraHeaders) });
}

export default async function pinGate(request, context) {
  const config = readSecurityConfig();

  if (!config.ok) {
    return htmlResponse(
      renderAccessPage({ configurationError: config.message }),
      503,
    );
  }

  const session = context.cookies.get(COOKIE_NAME);

  if (session && await verifySessionValue(session, config.secret)) {
    const response = await context.next();
    const headers = protectedResponseHeaders(response.headers);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const url = new URL(request.url);
  const returnTo = safeReturnTo(`${url.pathname}${url.search}`);

  return htmlResponse(renderAccessPage({ returnTo }), 401);
}

export const config = {
  path: "/*",
  excludedPath: ["/__hsf_access", "/__hsf_logout"],
};
