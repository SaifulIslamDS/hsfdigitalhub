
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
      "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
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
    :root{
      color-scheme:light;
      --green:#008C44;
      --deep:#006B35;
      --ink:#173F2A;
      --muted:#6A786F;
      --line:#D8E9DF;
      --soft:#F4FAF6;
      --white:#FFFFFF;
    }
    *{box-sizing:border-box}
    html,body{margin:0;min-height:100%;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#F2F8F4;color:var(--ink)}
    body{
      min-height:100vh;
      display:grid;
      place-items:center;
      padding:22px;
      background:
        radial-gradient(circle at 18% 14%,rgba(0,140,68,.10),transparent 28rem),
        radial-gradient(circle at 82% 84%,rgba(30,142,137,.08),transparent 26rem),
        linear-gradient(145deg,#F8FCF9,#EDF7F1);
    }
    .card{
      width:min(100%,560px);
      border:1px solid var(--line);
      border-radius:26px;
      background:rgba(255,255,255,.97);
      box-shadow:0 28px 70px rgba(16,62,36,.14);
      padding:42px 42px 34px;
    }
    .brand{
      display:flex;
      align-items:center;
      gap:15px;
      padding-bottom:24px;
      border-bottom:1px solid #E5EFE9;
    }
    .brand img{
      width:64px;
      height:64px;
      object-fit:contain;
      flex:0 0 auto;
    }
    .brand-name{
      font-size:13px;
      line-height:1.3;
      font-weight:900;
      letter-spacing:.12em;
      text-transform:uppercase;
      color:var(--green);
    }
    .hub-name{
      margin-top:5px;
      font-size:18px;
      line-height:1.3;
      font-weight:900;
      color:var(--ink);
    }
    .summary{
      margin:22px 0 28px;
      font-size:13px;
      line-height:1.65;
      color:var(--muted);
    }
    .eyebrow{
      font-size:10px;
      line-height:1;
      font-weight:900;
      letter-spacing:.16em;
      text-transform:uppercase;
      color:var(--green);
    }
    h1{
      margin:9px 0 7px;
      font-size:28px;
      line-height:1.15;
      letter-spacing:-.035em;
      color:var(--ink);
    }
    .session{
      margin:0 0 23px;
      font-size:12px;
      line-height:1.55;
      color:var(--muted);
    }
    label{
      display:block;
      margin-bottom:8px;
      font-size:12px;
      font-weight:900;
      color:#31483B;
    }
    .pin-wrap{position:relative}
    input{
      width:100%;
      height:56px;
      border:1px solid #CFE1D6;
      border-radius:14px;
      background:#FBFDFC;
      padding:0 58px 0 18px;
      outline:none;
      text-align:center;
      font-size:22px;
      font-weight:850;
      letter-spacing:.40em;
      color:var(--ink);
      transition:.18s;
    }
    input:focus{
      border-color:var(--green);
      background:#fff;
      box-shadow:0 0 0 4px rgba(0,140,68,.10);
    }
    .pin-toggle{
      position:absolute;
      top:50%;
      right:11px;
      width:38px;
      height:38px;
      margin:0;
      padding:0;
      transform:translateY(-50%);
      display:grid;
      place-items:center;
      border:0;
      border-radius:10px;
      background:transparent;
      color:#607269;
      box-shadow:none;
      cursor:pointer;
    }
    .pin-toggle:hover{background:#EDF7F1;color:var(--deep)}
    .pin-toggle:focus-visible{outline:2px solid var(--green);outline-offset:2px}
    .pin-toggle svg{width:20px;height:20px}
    .submit-btn{
      width:100%;
      height:50px;
      margin-top:14px;
      border:0;
      border-radius:13px;
      background:var(--green);
      color:#fff;
      font-size:14px;
      font-weight:900;
      cursor:pointer;
      box-shadow:0 10px 22px rgba(0,140,68,.17);
    }
    .submit-btn:hover{background:var(--deep)}
    .note{
      margin-top:13px;
      text-align:center;
      font-size:10.5px;
      line-height:1.5;
      color:#819087;
    }
    .footer{
      margin-top:26px;
      padding-top:18px;
      border-top:1px solid #E8F0EB;
      text-align:center;
      font-size:10px;
      color:#94A099;
    }
    .alert{
      margin:0 0 16px;
      border-radius:12px;
      padding:11px 13px;
      font-size:11px;
      line-height:1.5;
    }
    .error{background:#FFF2F1;border:1px solid #F4C7C3;color:#8B2D27}
    .config{background:#FFF9DF;border:1px solid #EBD998;color:#705A08}
    @media(max-width:620px){
      body{padding:14px}
      .card{padding:30px 24px 26px;border-radius:22px}
      .brand img{width:56px;height:56px}
      .hub-name{font-size:16px}
      h1{font-size:25px}
    }
  </style>
</head>
<body>
  <main class="card">
    <div class="brand">
      <img src="/assets/images/hsf-logo.png" alt="Human Safety Foundation logo">
      <div>
        <div class="brand-name">Human Safety Foundation</div>
        <div class="hub-name">Digital Transformation Knowledge Hub</div>
      </div>
    </div>

    <p class="summary">Protected HSF reference materials for authorized reviewers and collaborators.</p>

    <div class="eyebrow">Authorized access</div>
    <h1>Enter the 6-digit PIN</h1>
    <p class="session">The access session remains valid for up to 12 hours on this browser.</p>

    ${configurationHtml}
    ${errorHtml}

    ${hasConfigurationError ? "" : `
    <form action="/__hsf_access" method="post">
      <input type="hidden" name="return_to" value="${safeReturn}">
      <label for="pin">Access PIN</label>
      <div class="pin-wrap">
        <input
          id="pin"
          name="pin"
          type="password"
          inputmode="numeric"
          pattern="[0-9]{6}"
          maxlength="6"
          minlength="6"
          autocomplete="one-time-code"
          autofocus
          required
        >
        <button
          class="pin-toggle"
          id="pinToggle"
          type="button"
          aria-label="Show PIN"
          aria-pressed="false"
          title="Show PIN"
        >
          <svg id="eyeOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"></path>
            <circle cx="12" cy="12" r="2.7"></circle>
          </svg>
          <svg id="eyeClosed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" hidden>
            <path d="m3 3 18 18"></path>
            <path d="M10.6 10.6A2 2 0 0 0 13.4 13.4"></path>
            <path d="M9.9 4.3A10.8 10.8 0 0 1 12 4c6 0 9.5 8 9.5 8a16.6 16.6 0 0 1-2.1 3.1"></path>
            <path d="M6.6 6.6C4 8.4 2.5 12 2.5 12S6 20 12 20a9.7 9.7 0 0 0 4.1-.9"></path>
          </svg>
        </button>
      </div>
      <button class="submit-btn" type="submit">Access Knowledge Hub</button>
      <div class="note">Six numeric digits are required. Repeated failed attempts are rate-limited.</div>
    </form>`}

    <div class="footer">Human Safety Foundation (HSF) · Always we are...</div>
  </main>

  <script>
    (() => {
      const pin = document.getElementById("pin");
      const toggle = document.getElementById("pinToggle");
      const eyeOpen = document.getElementById("eyeOpen");
      const eyeClosed = document.getElementById("eyeClosed");

      if (!pin || !toggle || !eyeOpen || !eyeClosed) return;

      toggle.addEventListener("click", () => {
        const showing = pin.type === "text";
        pin.type = showing ? "password" : "text";
        toggle.setAttribute("aria-pressed", String(!showing));
        toggle.setAttribute("aria-label", showing ? "Show PIN" : "Hide PIN");
        toggle.setAttribute("title", showing ? "Show PIN" : "Hide PIN");
        eyeOpen.hidden = !showing;
        eyeClosed.hidden = showing;
        pin.focus({ preventScroll: true });
      });
    })();
  </script>
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
  excludedPath: ["/__hsf_access", "/__hsf_logout", "/assets/images/hsf-logo.png"],
};
