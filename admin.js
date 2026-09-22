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
    ["📘", "دفاتر مدرسية", "منتجات متنوعة للدراسة", "متوفر", ""],
    ["✏️", "أدوات مدرسية", "أقلام ومستلزمات", "متوفر", ""]
  ]
};


// تحميل البيانات
let data;

try {
  data = JSON.parse(localStorage.getItem("rayhana")) || defaults;
} catch (error) {
  data = defaults;
}

if (!Array.isArray(data.services)) {
  data.services = [];
}

if (!Array.isArray(data.products)) {
  data.products = [];
}


const $ = id => document.getElementById(id);


// ======================================================
// تحميل البيانات
// ======================================================

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


// ======================================================
// الخدمات
// ======================================================

function renderServices() {

  const box = $("services");

  box.innerHTML = data.services.map((service, index) => 
    
    <div class="admin-item">

      <input
        value="${escapeHtml(service[0])}"
        data-index="${index}"
        data-field="0"
        placeholder="الأيقونة"
      >

      <input
        value="${escapeHtml(service[1])}"
        data-index="${index}"
        data-field="1"
        placeholder="اسم الخدمة"
      >

      <textarea
        data-index="${index}"
        data-field="2"
        placeholder="وصف الخدمة"
      >${escapeHtml(service[2])}</textarea>

      <button
        type="button"
        onclick="removeService(${index})"
      >
        حذف
      </button>

    </div>

  ).join("");
}


// ======================================================
// المنتجات
// ======================================================

function renderProducts() {

  const box = $("products");

  box.innerHTML = data.products.map((product, index) => 

    <div class="admin-item product-admin-item">

      <h3>المنتج ${index + 1}</h3>

      <label>صورة المنتج</label>

      ${
        product[4]
          ? 
            <img
              src="${product[4]}"
              style="
                width:120px;
                height:120px;
                object-fit:cover;
                border-radius:12px;
                display:block;
                margin:10px 0;
              "
            >
          
          : 
            <div style="
              width:120px;
              height:120px;
              background:#eee;
              border-radius:12px;
              display:flex;
              align-items:center;
              justify-content:center;
              margin:10px 0;
            ">
              لا توجد صورة
            </div>
          
      }

      <input
        type="file"
        accept="image/*"
        data-image-index="${index}"
      >

      <input
        value="${escapeHtml(product[1])}"
        data-index="${index}"
        data-field="1"
        placeholder="اسم المنتج"
      >

      <input
        value="${escapeHtml(product[2])}"
        data-index="${index}"
        data-field="2"
        placeholder="وصف المنتج"
      >

      <input
        value="${escapeHtml(product[3])}"
        data-index="${index}"
        data-field="3"
        placeholder="الحالة مثل: متوفر"
      >

      <button
        type="button"
        onclick="removeProduct(${index})"
      >
        حذف المنتج
      </button>

    </div>

  ).join("");
  // اختيار الصور
  box.querySelectorAll("[data-image-index]").forEach(input => {

    input.addEventListener("change", async function () {

      const index = Number(this.dataset.imageIndex);

      const file = this.files[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("يرجى اختيار صورة فقط.");
        return;
      }

      try {

        const image = await resizeImage(file);

        data.products[index][4] = image;

        renderProducts();

      } catch (error) {

        alert("حدث خطأ أثناء قراءة الصورة.");

      }

    });

  });

}


// ======================================================
// تصغير الصور حتى لا يمتلئ localStorage
// ======================================================

function resizeImage(file) {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = function (event) {

      const img = new Image();

      img.onload = function () {

        const maxSize = 700;

        let width = img.width;
        let height = img.height;

        if (width > height) {

          if (width > maxSize) {
            height = Math.round(height * maxSize / width);
            width = maxSize;
          }

        } else {

          if (height > maxSize) {
            width = Math.round(width * maxSize / height);
            height = maxSize;
          }

        }

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0, width, height);

        resolve(
          canvas.toDataURL("image/jpeg", 0.80)
        );

      };

      img.onerror = reject;

      img.src = event.target.result;

    };

    reader.onerror = reject;

    reader.readAsDataURL(file);

  });

}


// ======================================================
// حماية النصوص
// ======================================================

function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


// ======================================================
// جمع البيانات
// ======================================================

function collectData() {

  data.title = $("title").value;
  data.heroTitle = $("heroTitle").value;
  data.heroText = $("heroText").value;
  data.phone = $("phone").value;
  data.address = $("address").value;
  data.hours = $("hours").value;


  document
    .querySelectorAll("#services [data-index]")
    .forEach(input => {

      const index = Number(input.dataset.index);
      const field = Number(input.dataset.field);

      if (data.services[index]) {
        data.services[index][field] = input.value;
      }

    });


  document
    .querySelectorAll("#products [data-index]")
    .forEach(input => {

      const index = Number(input.dataset.index);
      const field = Number(input.dataset.field);

      if (data.products[index]) {
        data.products[index][field] = input.value;
      }

    });

}


// ======================================================
// حفظ
// ======================================================

$("save").addEventListener("click", () => {

  collectData();

  try {

    localStorage.setItem(
      "rayhana",
      JSON.stringify(data)
    );

    $("status").textContent =
      "تم حفظ التغييرات والمنتجات بنجاح.";

  } catch (error) {

    $("status").textContent =
      "الصورة كبيرة جدًا. اختر صورة أصغر.";

  }

});


// ======================================================
// إضافة خدمة
// ======================================================

$("addService").addEventListener("click", () => {

  collectData();

  data.services.push([
    "🆕",
    "خدمة جديدة",
    "وصف الخدمة"
  ]);

  renderServices();

});


// ======================================================
// إضافة منتج
// ======================================================

$("addProduct").addEventListener("click", () => {
  collectData();

  data.products.push([
    "📦",
    "منتج جديد",
    "وصف المنتج",
    "متوفر",
    ""
  ]);

  renderProducts();

});


// ======================================================
// حذف خدمة
// ======================================================

function removeService(index) {

  collectData();

  data.services.splice(index, 1);

  renderServices();

}


// ======================================================
// حذف منتج
// ======================================================

function removeProduct(index) {

  collectData();

  data.products.splice(index, 1);

  renderProducts();

}


// ======================================================
// تشغيل النظام
// ======================================================

loadData();
