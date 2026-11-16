// Preserve paths and queries when redirecting the known production Pages alias.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === "ratemyusername.pages.dev") {
    url.hostname = "ratemyusername.fun";
    url.protocol = "https:";
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
