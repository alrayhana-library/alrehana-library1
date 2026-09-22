export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // حماية لوحة الإدارة فقط
    if (url.pathname.startsWith("/admin")) {
      const auth = request.headers.get("Authorization");

      // لم يتم تسجيل الدخول
      if (!auth || !auth.startsWith("Basic ")) {
        return new Response("Authentication required", {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Basic realm="Alrehana Library Admin"',
            "Cache-Control": "no-store"
          }
        });
      }

      try {
        // التأكد من وجود كلمة المرور في الإعدادات
        if (!env.ADMIN_PASSWORD) {
          return new Response(
            "ERROR: ADMIN_PASSWORD is not configured",
            {
              status: 500,
              headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-store"
              }
            }
          );
        }

        // فك بيانات تسجيل الدخول
        const decoded = atob(auth.slice(6));
        const separator = decoded.indexOf(":");

        if (separator === -1) {
          throw new Error("Invalid authorization");
        }

        const username = decoded.slice(0, separator);
        const password = decoded.slice(separator + 1);

        // التحقق من اسم المستخدم وكلمة المرور
        if (
          username !== "admin" ||
          password !== env.ADMIN_PASSWORD
        ) {
          return new Response("Unauthorized", {
            status: 401,
            headers: {
              "WWW-Authenticate":
                'Basic realm="Alrehana Library Admin"',
              "Cache-Control": "no-store"
            }
          });
        }

      } catch (error) {
        return new Response("Unauthorized", {
          status: 401,
          headers: {
            "WWW-Authenticate":
              'Basic realm="Alrehana Library Admin"',
            "Cache-Control": "no-store"
          }
        });
      }
    }

    // السماح بفتح بقية الموقع
    return env.ASSETS.fetch(request);
  }
};
