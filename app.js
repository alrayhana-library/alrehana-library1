const defaults = {
  title: "مكتبة الريحانة",

  heroTitle:
    "كل ما تحتاجه للدراسة والعمل في مكان واحد",

  heroText:
    "طباعة واستنساخ وقرطاسية وخدمات إلكترونية مع إمكانية التوصيل.",

  phone:
    "07855716535",

  address:
    "بغداد",

  hours:
    "متوفرة بكل وقت",

  services: [
    ["🖨️", "طباعة", "طباعة المستندات والملفات بجودة واضحة."],
    ["📄", "استنساخ", "استنساخ الملازم والوثائق والمستندات."],
    ["📚", "قرطاسية", "دفاتر وأقلام ومستلزمات مدرسية."],
    ["📱", "تقديم إلكتروني", "خدمات إلكترونية ومساعدة في التقديم."],
    ["📎", "تجليد", "تجهيز الملازم والملفات بشكل مرتب."],
    ["🚚", "توصيل", "إمكانية توصيل الطلبات حسب المتاح."]
  ]
};


async function loadProducts() {
  try {
    const response = await fetch("/api/products", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("products error");
    }

    return await response.json();

  } catch (error) {
    console.error(error);
    return [];
  }
}


function renderServices() {
  const servicesGrid =
    document.getElementById("servicesGrid");

  if (!servicesGrid) return;

  servicesGrid.innerHTML =
    defaults.services.map(x => `
      <article class="card">
        <b>${escapeHtml(x[0])}</b>
        <h3>${escapeHtml(x[1])}</h3>
        <p>${escapeHtml(x[2])}</p>
      </article>
    `).join("");
}


function renderProducts(products) {
  const productsGrid =
    document.getElementById("productsGrid");

  if (!productsGrid) return;

  if (!products.length) {
    productsGrid.innerHTML = `
      <p>لا توجد منتجات مضافة حالياً.</p>
    `;

    return;
  }

  productsGrid.innerHTML =
    products.map(product => `
      <article class="card product-card">

        ${
          product.image
            ? `
              <img
                src="${escapeHtml(product.image)}"
                alt="${escapeHtml(product.name)}"
                style="
                  width:100%;
                  max-width:260px;
                  height:220px;
                  object-fit:cover;
                  border-radius:12px;
                  display:block;
                  margin:auto;
                "
              >
            `
            : `
              <div style="font-size:55px;text-align:center;">
                ${escapeHtml(product.icon || "📦")}
              </div>
            `
        }

        <h3>${escapeHtml(product.name)}</h3>

        <p>
          ${escapeHtml(product.description || "")}
        </p>

        <strong>
          ${escapeHtml(product.status || "متوفر")}
        </strong>

      </article>
    `).join("");
}


function escapeHtml(text) {
  const div = document.createElement("div");

  div.textContent = text ?? "";

  return div.innerHTML;
}


async function render() {

  const siteTitle =
    document.getElementById("siteTitle");

  const heroTitle =
    document.getElementById("heroTitle");

  const heroText =
    document.getElementById("heroText");

  const phoneDisplay =
    document.getElementById("phoneDisplay");

  const address =
    document.getElementById("address");

  const hours =
    document.getElementById("hours");


  if (siteTitle)
    siteTitle.textContent = defaults.title;

  if (heroTitle)
    heroTitle.textContent = defaults.heroTitle;

  if (heroText)
    heroText.textContent = defaults.heroText;

  if (phoneDisplay)
    phoneDisplay.textContent = defaults.phone;

  if (address)
    address.textContent = defaults.address;

  if (hours)
    hours.textContent = defaults.hours;


  renderServices();


  const products = await loadProducts();

  renderProducts(products);


  const serviceSelect =
    document.getElementById("service");

  if (serviceSelect) {

    serviceSelect.innerHTML =
      defaults.services.map(x => `
        <option value="${escapeHtml(x[1])}">
          ${escapeHtml(x[1])}
        </option>
      `).join("");

  }


  const year =
    document.getElementById("year");

  if (year) {
    year.textContent =
      new Date().getFullYear();
  }
}


const orderForm =
  document.getElementById("orderForm");

if (orderForm) {

  orderForm.onsubmit = event => {

    event.preventDefault();

    const msg =
      document.getElementById("msg");

    if (msg) {

      msg.textContent =
        "تم استلام الطلب مبدئيًا. يرجى التواصل لتأكيد التفاصيل.";

    }

  };

}


render();
