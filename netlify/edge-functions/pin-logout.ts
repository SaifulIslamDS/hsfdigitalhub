
const COOKIE_NAME = "hsf_access_v1";
const IDLE_COOKIE_NAME = "hsf_idle_v1";

export default async function pinLogout(_request, context) {
  context.cookies.delete({
    name: COOKIE_NAME,
    path: "/",
  });
  context.cookies.delete({
    name: IDLE_COOKIE_NAME,
    path: "/",
  });

  return new Response(null, {
    status: 303,
    headers: {
      "location": "/",
      "cache-control": "private, no-store, max-age=0",
      "pragma": "no-cache",
      "clear-site-data": "\"cache\"",
      "x-robots-tag": "noindex, nofollow, noarchive, nosnippet",
      "referrer-policy": "no-referrer",
    },
  });
}

export const config = {
  path: "/__hsf_logout",
  method: ["GET", "POST"],
};
