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

    ${error ? <div class="error">${escapeHtml(error)}</div> : ""}

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
</html>`;
}


// ======================================================
// حماية نص رسالة الخطأ
// ======================================================

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
    }
