const productsBox = document.getElementById("products");
const addProductButton = document.getElementById("addProduct");

let products = [];

async function loadProducts() {
  const response = await fetch("/api/products");

  if (!response.ok) {
    productsBox.innerHTML = "<p>تعذر تحميل المنتجات.</p>";
    return;
  }

  products = await response.json();
  renderProducts();
}

function renderProducts() {
  productsBox.innerHTML = "";

  if (!products.length) {
    productsBox.innerHTML = "<p>لا توجد منتجات حالياً.</p>";
    return;
  }

  products.forEach(product => {
    const box = document.createElement("div");
    box.className = "card";

    box.style.marginBottom = "15px";

    box.innerHTML = 
      ${
        product.image
          ? <img src="${product.image}" style="width:120px;height:120px;object-fit:cover;border-radius:10px;">
          : <div style="font-size:45px;">${escapeHtml(product.icon)}</div>
      }

      <h3>${escapeHtml(product.name)}</h3>

      <p>${escapeHtml(product.description)}</p>

      <strong>${escapeHtml(product.status)}</strong>

      <br><br>

      <button
        type="button"
        data-delete="${product.id}"
        style="background:#b00020;"
      >
        حذف المنتج
      </button>
    ;

    productsBox.appendChild(box);
  });

  document.querySelectorAll("[data-delete]").forEach(button => {
    button.addEventListener("click", () => {
      deleteProduct(button.dataset.delete);
    });
  });
}


addProductButton.addEventListener("click", () => {
  const box = document.createElement("div");

  box.className = "card";

  box.style.marginTop = "15px";

  box.innerHTML = 
    <h3>إضافة منتج جديد</h3>

    <label>رمز المنتج</label>
    <input
      class="product-icon"
      type="text"
      value="📦"
      maxlength="10"
    >

    <label>اسم المنتج</label>
    <input
      class="product-name"
      type="text"
      placeholder="مثلاً: دفتر مدرسي"
    >

    <label>وصف المنتج</label>
    <textarea
      class="product-description"
      rows="3"
      placeholder="وصف المنتج"
    ></textarea>

    <label>الحالة</label>
    <input
      class="product-status"
      type="text"
      value="متوفر"
    >

    <label>صورة المنتج</label>
    <input
      class="product-image"
      type="file"
      accept="image/*"
    >

    <img
      class="image-preview"
      style="display:none;width:150px;height:150px;object-fit:cover;border-radius:10px;margin-top:10px;"
    >

    <br>

    <button
      type="button"
      class="save-product"
    >
      حفظ المنتج
    </button>

    <button
      type="button"
      class="cancel-product"
      style="background:#777;margin-top:8px;"
    >
      إلغاء
    </button>
  ;

  productsBox.prepend(box);

  const imageInput = box.querySelector(".product-image");
  const preview = box.querySelector(".image-preview");

  imageInput.addEventListener("change", async () => {
    if (!imageInput.files[0]) return;

    try {
      preview.src = await resizeImage(imageInput.files[0]);
      preview.style.display = "block";
    } catch {
      alert("تعذر قراءة الصورة.");
    }
  });

  box.querySelector(".cancel-product").onclick = () => {
    box.remove();
  };

  box.querySelector(".save-product").onclick = async () => {
    const name = box.querySelector(".product-name").value.trim();

    if (!name) {
      alert("اكتب اسم المنتج.");
      return;
    }

    let image = "";

    if (imageInput.files[0]) {
      image = await resizeImage(imageInput.files[0]);

      if (image.length > 750000) {
        alert("الصورة كبيرة جداً. اختر صورة أصغر.");
        return;
      }
    }

    const product = {
      icon: box.querySelector(".product-icon").value.trim() || "📦",
      name,
      description: box.querySelector(".product-description").value.trim(),
      status: box.querySelector(".product-status").value.trim() || "متوفر",
      image
    };

    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(product)
    });const result = await response.json();

    if (!response.ok) {
      alert(result.error || "تعذر حفظ المنتج.");
      return;
    }

    alert("تم حفظ المنتج وسيظهر لجميع الزوار.");

    box.remove();

    await loadProducts();
  };
});


async function deleteProduct(id) {
  if (!confirm("هل تريد حذف هذا المنتج؟")) {
    return;
  }

  const response = await fetch(
    "/api/products/" + encodeURIComponent(id),
    {
      method: "DELETE"
    }
  );

  const result = await response.json();

  if (!response.ok) {
    alert(result.error || "تعذر حذف المنتج.");
    return;
  }

  await loadProducts();
}


function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const maxSize = 700;

        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round(height * maxSize / width);
            width = maxSize;
          } else {
            width = Math.round(width * maxSize / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );

        resolve(
          canvas.toDataURL("image/jpeg", 0.75)
        );
      };

      img.onerror = reject;

      img.src = reader.result;
    };

    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}


function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}


// تحميل المنتجات عند فتح لوحة الإدارة
loadProducts();
