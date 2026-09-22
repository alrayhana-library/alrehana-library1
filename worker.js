// ======================================================
// مكتبة الريحانة - Worker
// المنتجات مشتركة بين جميع الزوار باستخدام D1
// ======================================================

const COOKIE_NAME = "rayhana_admin";
const SESSION_DAYS = 7;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      // --------------------------------------------------
      // إنشاء جدول المنتجات تلقائياً إذا لم يكن موجوداً
      // --------------------------------------------------
      await env.MY_DB.prepare(
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          icon TEXT DEFAULT '📦',
          name TEXT NOT NULL,
          description TEXT DEFAULT '',
          status TEXT DEFAULT 'متوفر',
          image TEXT DEFAULT '',
          created_at INTEGER NOT NULL
        )
      ).run();

      // --------------------------------------------------
      // تسجيل الدخول
      // --------------------------------------------------
      if (url.pathname === "/admin/login" && request.method === "GET") {
        return html(loginPage(""));
      }

      if (url.pathname === "/admin/login" && request.method === "POST") {
        return await login(request, env);
      }

      // --------------------------------------------------
      // تسجيل الخروج
      // --------------------------------------------------
      if (url.pathname === "/admin/logout") {
        return new Response("", {
          status: 302,
          headers: {
            "Location": "/admin/login",
            "Set-Cookie": ${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict
          }
        });
      }

      // --------------------------------------------------
      // لوحة الإدارة
      // --------------------------------------------------
      if (url.pathname === "/admin") {
        if (!isLoggedIn(request, env)) {
          return new Response("", {
            status: 302,
            headers: { Location: "/admin/login" }
          });
        }

        return env.ASSETS.fetch(
          new Request(new URL("/admin.html", request.url), request)
        );
      }

      // --------------------------------------------------
      // API المنتجات - متاح للزوار للقراءة
      // --------------------------------------------------
      if (url.pathname === "/api/products" && request.method === "GET") {
        const result = await env.MY_DB.prepare(
          SELECT
            id,
            icon,
            name,
            description,
            status,
            image
          FROM products
          ORDER BY id DESC
        ).all();

        return json(result.results || []);
      }

      // --------------------------------------------------
      // API إضافة منتج
      // --------------------------------------------------
      if (url.pathname === "/api/products" && request.method === "POST") {
        if (!isLoggedIn(request, env)) {
          return json({ error: "غير مصرح" }, 401);
        }

        const body = await request.json();

        const icon = clean(body.icon, 20) || "📦";
        const name = clean(body.name, 120);
        const description = clean(body.description, 500);
        const status = clean(body.status, 50) || "متوفر";
        const image = typeof body.image === "string" ? body.image : "";

        if (!name) {
          return json({ error: "اسم المنتج مطلوب" }, 400);
        }

        // منع الصور الكبيرة جداً
        if (image.length > 800000) {
          return json({
            error: "حجم الصورة كبير. اختر صورة أصغر."
          }, 400);
        }

        const result = await env.MY_DB.prepare(
          INSERT INTO products
          (icon, name, description, status, image, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        )
          .bind(
            icon,
            name,
            description,
            status,
            image,
            Date.now()
          )
          .run();
            return json({
          success: true,
          id: result.meta.last_row_id
        });
      }

      // --------------------------------------------------
      // حذف منتج
      // --------------------------------------------------
      const deleteMatch = url.pathname.match(/^\/api\/products\/(\d+)$/);

      if (deleteMatch && request.method === "DELETE") {
        if (!isLoggedIn(request, env)) {
          return json({ error: "غير مصرح" }, 401);
        }

        const id = Number(deleteMatch[1]);

        await env.MY_DB.prepare(
          "DELETE FROM products WHERE id = ?"
        )
          .bind(id)
          .run();

        return json({ success: true });
      }

      // --------------------------------------------------
      // التحقق من جلسة المسؤول
      // --------------------------------------------------
      if (url.pathname === "/api/me") {
        return json({
          loggedIn: isLoggedIn(request, env)
        });
      }

      // --------------------------------------------------
      // باقي الملفات: index.html / style.css / app.js...
      // --------------------------------------------------
      return env.ASSETS.fetch(request);

    } catch (error) {
      console.error(error);

      return json({
        error: "حدث خطأ في الخادم"
      }, 500);
    }
  }
};


// ======================================================
// تسجيل الدخول
// ======================================================

async function login(request, env) {
  const form = await request.formData();

  const username = String(form.get("username") || "");
  const password = String(form.get("password") || "");

  const correctUsername = env.ADMIN_USERNAME;
  const correctPassword = env.ADMIN_PASSWORD;

  if (!correctUsername  !correctPassword  !env.SESSION_SECRET) {
    return new Response(
      "يجب إعداد ADMIN_USERNAME و ADMIN_PASSWORD و SESSION_SECRET في متغيرات Worker.",
      { status: 500 }
    );
  }

  if (username !== correctUsername || password !== correctPassword) {
    return html(loginPage("اسم المستخدم أو كلمة المرور غير صحيحة"), 401);
  }

  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;

  const payload = ${username}|${expires};

  const signature = await sign(payload, env.SESSION_SECRET);

  const token = base64url(payload) + "." + signature;

  return new Response("", {
    status: 302,
    headers: {
      Location: "/admin",
      "Set-Cookie":
        ${COOKIE_NAME}=${token}; Path=/; Max-Age=${SESSION_DAYS * 86400}; HttpOnly; Secure; SameSite=Strict
    }
  });
}


// ======================================================
// التحقق من تسجيل دخول المسؤول
// ======================================================

async function isLoggedIn(request, env) {
  const cookieHeader = request.headers.get("Cookie") || "";

  const match = cookieHeader.match(
    new RegExp(${COOKIE_NAME}=([^;]+))
  );

  if (!match) return false;

  const token = match[1];

  const parts = token.split(".");

  if (parts.length !== 2) return false;

  try {
    const payload = decodeBase64url(parts[0]);
    const signature = parts[1];

    const expected = await sign(
      payload,
      env.SESSION_SECRET
    );

    if (signature !== expected) {
      return false;
    }

    const [username, expires] = payload.split("|");

    if (username !== env.ADMIN_USERNAME) {
      return false;
    }

    if (Date.now() > Number(expires)) {
      return false;
    }

    return true;

  } catch {
    return false;
  }
}


// ======================================================
// توقيع الجلسة
// ======================================================

async function sign(text, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(text)
  );

  return base64urlBytes(new Uint8Array(signature));
                // ======================================================
// أدوات مساعدة
// ======================================================

function base64url(text) {
  return base64urlBytes(
    new TextEncoder().encode(text)
  );
}

function base64urlBytes(bytes) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function decodeBase64url(value) {
  value = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  while (value.length % 4) {
    value += "=";
  }

  return new TextDecoder().decode(
    Uint8Array.from(
      atob(value),
      c => c.charCodeAt(0)
    )
  );
}

function clean(value, maxLength) {
  return String(value || "")
    .trim()
    .slice(0, maxLength);
}

function json(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "Cache-Control": "no-store"
      }
    }
  );
}

function html(content, status = 200) {
  return new Response(content, {
    status,
    headers: {
      "Content-Type": "text/html; charset=UTF-8"
    }
  });
}


// ======================================================
// صفحة تسجيل الدخول
// ======================================================

function loginPage(error) {
  return <!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>تسجيل دخول المسؤول</title>

  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      font-family: Arial, sans-serif;
    }

    .login-box {
      width: 90%;
      max-width: 420px;
      background: white;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 5px 25px rgba(0,0,0,0.12);
    }

    h1 {
      margin-top: 0;
      text-align: center;
      font-size: 25px;
    }

    .subtitle {
      text-align: center;
      color: #777;
      margin-bottom: 25px;
    }

    label {
      display: block;
      margin-bottom: 7px;
      font-weight: bold;
    }

    input {
      box-sizing: border-box;
      width: 100%;
      padding: 13px;
      margin-bottom: 18px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 16px;
      direction: ltr;
    }

    button {
      width: 100%;
      padding: 14px;
      border: 0;
      border-radius: 8px;
      background: #222;
      color: white;
      font-size: 17px;
      cursor: pointer;
    }

    button:hover {
      opacity: 0.9;
    }

    .error {
      background: #ffe8e8;
      color: #b00020;
      padding: 10px;
      border-radius: 8px;
      margin-bottom: 18px;
      text-align: center;
    }
  </style>
</head>

<body>

  <div class="login-box">

    <h1>لوحة إدارة مكتبة الريحانة</h1>

    <div class="subtitle">
      تسجيل دخول المسؤول
    </div>

    ${
      error
        ? <div class="error">${escapeHtml(error)}</div>
        : ""
    }

    <form method="POST" action="/admin/login">

      <label>اسم المستخدم</label>

      <input
        type="text"
        name="username"
        autocomplete="username"
        required
      >

      <label>كلمة المرور</label>

      <input
        type="password"
        name="password"
        autocomplete="current-password"
        required
      >

      <button type="submit">
        تسجيل الدخول
      </button>

    </form>

  </div>

</body>
</html>;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
        }
