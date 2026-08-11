import {
  COOKIE_NAME,
  htmlResponse,
  protectedResponseHeaders,
  readSecurityConfig,
  renderAccessPage,
  safeReturnTo,
  verifySessionValue,
} from "./_pin-utils.ts";

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

  return htmlResponse(
    renderAccessPage({ returnTo }),
    401,
  );
}

export const config = {
  path: "/*",
  excludedPath: ["/__hsf_access", "/__hsf_logout"],
};
