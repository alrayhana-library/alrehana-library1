export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // حماية لوحة الإدارة فقط
    if (url.pathname.startsWith("/admin")) {
      const auth = request.headers.get("Authorization");

      if (!auth || !auth.startsWith("Basic ")) {
        return new Response("Authentication required", {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Basic realm="Alrehana Library Admin"'
          }
        });
      }

      try {
        const decoded = atob(auth.slice(6));
        const separator = decoded.indexOf(":");

        const username = decoded.slice(0, separator);
        const password = decoded.slice(separator + 1);

        if (
          username !== "admin" ||
          password !== env.ADMIN_PASSWORD
        ) {
          return new Response("Unauthorized", {
            status: 401,
            headers: {
              "WWW-Authenticate": 'Basic realm="Alrehana Library Admin"'
            }
          });
        }
      } catch {
        return new Response("Unauthorized", { status: 401 });
      }
    }

    return env.ASSETS.fetch(request);
  }
};
