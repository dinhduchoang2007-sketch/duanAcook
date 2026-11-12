/* Trang chứng nhận: lọc hồ sơ + trình xem từng trang */
(() => {
  const $ = (s, r = document) => r.querySelector(s),
    $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const BASE = "assets/img/phap-ly/";

  /* lọc */
  $$(".chips .chip[data-f]").forEach((b) =>
    b.addEventListener("click", () => {
      $$(".chips .chip[data-f]").forEach((x) => x.classList.toggle("on", x === b));
      $$(".dcard").forEach((c) => (c.hidden = !!b.dataset.f && c.dataset.k !== b.dataset.f));
    }),
  );

  /* trình xem */
  const v = document.createElement("div");
  v.className = "dv";
  v.setAttribute("role", "dialog");
  v.setAttribute("aria-modal", "true");
  v.setAttribute("aria-label", "Xem hồ sơ");
  v.innerHTML =
    '<div class="dv-top"><div><h2></h2><p></p></div><button type="button" class="dv-x">Đóng</button></div>' +
    '<div class="dv-body"><div class="dv-th"></div><div class="dv-stage"><img alt="" /></div></div>' +
    '<div class="dv-bot"><div class="dv-nav"><button type="button" class="dv-pv">Trang trước</button><span class="dv-ct" aria-live="polite"></span><button type="button" class="dv-nx">Trang sau</button></div><button type="button" class="dv-zoom">Phóng to</button></div>';
  document.body.appendChild(v);
  const img = $(".dv-stage img", v),
    stage = $(".dv-stage", v),
    th = $(".dv-th", v),
    ct = $(".dv-ct", v),
    pv = $(".dv-pv", v),
    nx = $(".dv-nx", v),
    zm = $(".dv-zoom", v);
  let slug = "",
    n = 0,
    k = 1,
    title = "",
    opener = null;

  const show = (i) => {
    k = Math.min(n, Math.max(1, i));
    img.src = BASE + slug + "/" + k + ".webp";
    img.alt = title + ", trang " + k + " trên " + n;
    ct.textContent = "Trang " + k + " / " + n;
    pv.disabled = k === 1;
    nx.disabled = k === n;
    $$("button", th).forEach((b, j) => {
      b.classList.toggle("on", j === k - 1);
      if (j === k - 1) b.scrollIntoView({ block: "nearest" });
    });
    stage.scrollTo(0, 0);
  };
  const setZoom = (z) => {
    stage.classList.toggle("z", z);
    zm.textContent = z ? "Thu nhỏ" : "Phóng to";
  };
  const open = (btn) => {
    opener = btn;
    slug = btn.dataset.slug;
    n = +btn.dataset.n;
    title = btn.dataset.title;
    $("h2", v).textContent = title;
    $("p", v).textContent = btn.dataset.no;
    th.innerHTML = "";
    for (let i = 1; i <= n; i++) {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Trang " + i);
      b.innerHTML = '<img src="' + BASE + slug + "/" + i + '.webp" alt="" loading="lazy" /><span>' + i + "</span>";
      b.addEventListener("click", () => show(i));
      th.appendChild(b);
    }
    setZoom(false);
    show(1);
    v.classList.add("on");
    document.body.style.overflow = "hidden";
    $(".dv-x", v).focus();
  };
  const close = () => {
    v.classList.remove("on");
    document.body.style.overflow = "";
    opener && opener.focus();
  };
  $$(".dopen").forEach((b) => b.addEventListener("click", () => open(b)));
  $(".dv-x", v).addEventListener("click", close);
  pv.addEventListener("click", () => show(k - 1));
  nx.addEventListener("click", () => show(k + 1));
  zm.addEventListener("click", () => setZoom(!stage.classList.contains("z")));
  img.addEventListener("click", () => setZoom(!stage.classList.contains("z")));
  addEventListener("keydown", (e) => {
    if (!v.classList.contains("on")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(k - 1);
    else if (e.key === "ArrowRight") show(k + 1);
  });

  /* mở thẳng hồ sơ từ đường dẫn #slug (dùng cho ô tìm kiếm) */
  const h = decodeURIComponent(location.hash.slice(1));
  if (h) {
    const b = $('.dopen[data-slug="' + h + '"]');
    if (b) setTimeout(() => open(b), 400);
  }
})();
