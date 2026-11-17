const allowedOrigins = new Set([
  "https://invitationcard-tau.vercel.app",
  "https://aidit-athirah-digital-card.pages.dev",
  "http://localhost:8080",
]);

export async function onRequest(context: {
  request: Request;
  next: () => Promise<Response>;
}): Promise<Response> {
  const origin = context.request.headers.get("Origin") || "";
  const headers = new Headers({
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  });

  if (allowedOrigins.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  const response = await context.next();
  const responseHeaders = new Headers(response.headers);
  headers.forEach((value, key) => responseHeaders.set(key, value));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}
