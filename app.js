const defaults={
title:"مكتبة الريحانة",
heroTitle:"كل ما تحتاجه للدراسة والعمل في مكان واحد",
heroText:"طباعة واستنساخ وقرطاسية وخدمات إلكترونية مع إمكانية التوصيل.",
phone:"أضف رقم الهاتف من لوحة الإدارة",
address:"أضف العنوان من لوحة الإدارة",
hours:"أضف أوقات الدوام من لوحة الإدارة",
services:[
["🖨️","طباعة","طباعة المستندات والملفات بجودة واضحة."],
["📄","استنساخ","استنساخ الملازم والوثائق والمستندات."],
["📚","قرطاسية","دفاتر وأقلام ومستلزمات مدرسية."],
["📱","تقديم إلكتروني","خدمات إلكترونية ومساعدة في التقديم."],
["📎","تجليد","تجهيز الملازم والملفات بشكل مرتب."],
["🚚","توصيل","إمكانية توصيل الطلبات حسب المتاح."]
],
products:[
["📘","دفاتر مدرسية","منتجات متنوعة للدراسة","متوفر"],
["✏️","أدوات مدرسية","أقلام ومستلزمات","متوفر"],
["📗","ملازم دراسية","طباعة وتجهيز حسب الطلب","حسب الطلب"]
]
};

const data=JSON.parse(localStorage.rayhana||"null")||defaults;

function render(){
document.getElementById("siteTitle").textContent=data.title;
document.getElementById("heroTitle").textContent=data.heroTitle;
document.getElementById("heroText").textContent=data.heroText;
document.getElementById("phoneDisplay").textContent=data.phone;
document.getElementById("address").textContent=data.address;
document.getElementById("hours").textContent=data.hours;

document.getElementById("servicesGrid").innerHTML=data.services.map(x=>
`<article class="card"><b>${x[0]}</b><h3>${x[1]}</h3><p>${x[2]}</p></article>`
).join("");

document.getElementById("productsGrid").innerHTML=data.products.map(x=>
`<article class="card"><b>${x[0]}</b><h3>${x[1]}</h3><p>${x[2]}</p><strong>${x[3]}</strong></article>`
).join("");

document.getElementById("service").innerHTML=data.services.map(x=>
`<option>${x[1]}</option>`
).join("");

document.getElementById("year").textContent=new Date().getFullYear();
}

render();

document.getElementById("orderForm").onsubmit=e=>{
e.preventDefault();
document.getElementById("msg").textContent="تم استلام الطلب مبدئيًا. يرجى التواصل لتأكيد التفاصيل.";
};
