const defaults = {
  title: "مكتبة الريحانة",
  heroTitle: "كل ما تحتاجه للدراسة والعمل في مكان واحد",
  heroText: "طباعة واستنساخ وقرطاسية وخدمات إلكترونية مع إمكانية التوصيل.",
  phone: "أضف رقم الهاتف من لوحة الإدارة",
  address: "أضف العنوان من لوحة الإدارة",
  hours: "أضف أوقات الدوام من لوحة الإدارة",
  services: [
    ["🖨️", "طباعة", "طباعة المستندات والملفات بجودة واضحة."],
    ["📄", "استنساخ", "استنساخ الملازم والوثائق والمستندات."],
    ["📚", "قرطاسية", "دفاتر وأقلام ومستلزمات مدرسية."]
  ],
  products: [
    ["📘", "دفاتر مدرسية", "منتجات متنوعة للدراسة", "متوفر"],
    ["✏️", "أدوات مدرسية", "أقلام ومستلزمات", "متوفر"]
  ]
};

let data = JSON.parse(localStorage.getItem("rayhana") || "null") || defaults;

const $ = id => document.getElementById(id);

function loadData() {
  $("title").value = data.title || "";
  $("heroTitle").value = data.heroTitle || "";
  $("heroText").value = data.heroText || "";
  $("phone").value = data.phone || "";
  $("address").value = data.address || "";
  $("hours").value = data.hours || "";

  renderServices();
  renderProducts();
}

function renderServices() {
  const box = $("services");

  box.innerHTML = data.services.map((service, index) => `
    <div class="admin-item">
      <input value="${escapeHtml(service[0])}" data-index="${index}" data-field="0" placeholder="الأيقونة">
      <input value="${escapeHtml(service[1])}" data-index="${index}" data-field="1" placeholder="اسم الخدمة">
      <textarea data-index="${index}" data-field="2" placeholder="وصف الخدمة">${escapeHtml(service[2])}</textarea>
      <button type="button" onclick="removeService(${index})">حذف</button>
    </div>
  `).join("");
}

function renderProducts() {
  const box = $("products");

  box.innerHTML = data.products.map((product, index) => `
    <div class="admin-item">
      <input value="${escapeHtml(product[0])}" data-index="${index}" data-field="0" placeholder="الأيقونة">
      <input value="${escapeHtml(product[1])}" data-index="${index}" data-field="1" placeholder="اسم المنتج">
      <input value="${escapeHtml(product[2])}" data-index="${index}" data-field="2" placeholder="الوصف">
      <input value="${escapeHtml(product[3])}" data-index="${index}" data-field="3" placeholder="الحالة">
      <button type="button" onclick="removeProduct(${index})">حذف</button>
    </div>
  `).join("");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function collectData() {
  data.title = $("title").value;
  data.heroTitle = $("heroTitle").value;
  data.heroText = $("heroText").value;
  data.phone = $("phone").value;
  data.address = $("address").value;
  data.hours = $("hours").value;

  document.querySelectorAll("#services [data-index]").forEach(input => {
    const index = Number(input.dataset.index);
    const field = Number(input.dataset.field);

    if (data.services[index]) {
      data.services[index][field] = input.value;
    }
  });

  document.querySelectorAll("#products [data-index]").forEach(input => {
    const index = Number(input.dataset.index);
    const field = Number(input.dataset.field);

    if (data.products[index]) {
      data.products[index][field] = input.value;
    }
  });
}

$("save").addEventListener("click", () => {
  collectData();

  localStorage.setItem("rayhana", JSON.stringify(data));

  $("status").textContent = "تم حفظ التغييرات بنجاح.";
});

$("addService").addEventListener("click", () => {
  collectData();

  data.services.push([
    "🆕",
    "خدمة جديدة",
    "وصف الخدمة"
  ]);

  renderServices();
});

$("addProduct").addEventListener("click", () => {
  collectData();

  data.products.push([
    "📦",
    "منتج جديد",
    "وصف المنتج",
    "متوفر"
  ]);

  renderProducts();
});

function removeService(index) {
  collectData();

  data.services.splice(index, 1);

  renderServices();
}

function removeProduct(index) {
  collectData();

  data.products.splice(index, 1);

  renderProducts();
}

loadData();
