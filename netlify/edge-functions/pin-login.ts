import {
  COOKIE_NAME,
  createSessionValue,
  htmlResponse,
  pinMatches,
  readSecurityConfig,
  renderAccessPage,
  safeReturnTo,
  securityHeaders,
} from "./_pin-utils.ts";

export default async function pinLogin(request, context) {
  const config = readSecurityConfig();

  if (!config.ok) {
    return htmlResponse(
      renderAccessPage({ configurationError: config.message }),
      503,
    );
  }

  if (request.method === "GET") {
    const url = new URL(request.url);
    const returnTo = safeReturnTo(url.searchParams.get("return_to") ?? "/");
    return htmlResponse(renderAccessPage({ returnTo }), 200);
  }

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: {
        ...securityHeaders(),
        "allow": "GET, POST",
      },
    });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return htmlResponse(
      renderAccessPage({
        error: "The access request could not be read. Please try again.",
      }),
      400,
    );
  }

  const submittedPin = String(form.get("pin") ?? "").trim();
  const returnTo = safeReturnTo(String(form.get("return_to") ?? "/"));

  if (!/^\d{6}$/.test(submittedPin)) {
    return htmlResponse(
      renderAccessPage({
        returnTo,
        error: "A valid 6-digit PIN is required.",
      }),
      401,
    );
  }

  if (!await pinMatches(submittedPin, config.pin)) {
    return htmlResponse(
      renderAccessPage({
        returnTo,
        error: "The PIN was not accepted. Please check it and try again.",
      }),
      401,
    );
  }

  const session = await createSessionValue(config.secret);

  context.cookies.set({
    name: COOKIE_NAME,
    value: session.value,
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "strict",
    expires: new Date(session.expiresAt * 1000),
  });

  return new Response(null, {
    status: 303,
    headers: {
      "location": returnTo,
      "cache-control": "private, no-store, max-age=0",
      "pragma": "no-cache",
      "x-robots-tag": "noindex, nofollow, noarchive, nosnippet",
      "referrer-policy": "no-referrer",
    },
  });
}

export const config = {
  path: "/__hsf_access",
  method: ["GET", "POST"],
  rateLimit: {
    windowLimit: 5,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
