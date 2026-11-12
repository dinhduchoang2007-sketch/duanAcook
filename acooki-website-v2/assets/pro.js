/* ACOOKI PRO — video phát tại chỗ, "sản phẩm vừa xem" */
(() => {
  const $ = (s, r = document) => r.querySelector(s),
    $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- 1. Video: bấm là phát ngay trên trang chủ ---------- */
  $$(".yt").forEach((box) => {
    const id = box.dataset.id,
      btn = $(".yt-play", box),
      img = $("img", box);
    if (img) {
      img.addEventListener("error", () => {
        if (!img.dataset.fb) {
          img.dataset.fb = "1";
          img.src = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
        }
      });
    }
    const play = () => {
      // Mở file trực tiếp từ máy (file://): YouTube chặn nhúng (lỗi 153) -> mở YouTube ở tab mới
      if (location.protocol === "file:") {
        window.open("https://www.youtube.com/watch?v=" + id, "_blank", "noopener");
        return;
      }
      const f = document.createElement("iframe");
      f.src =
        "https://www.youtube.com/embed/" +
        id +
        "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
      f.title = box.dataset.title || "Video Acooki";
      f.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      f.referrerPolicy = "strict-origin-when-cross-origin";
      box.classList.add("on");
      box.appendChild(f);
    };
    btn && btn.addEventListener("click", play);
  });

  /* ---------- 2. Sản phẩm vừa xem ---------- */
  const KEY = "acooki-rv";
  const P = {
    "vi-ngu": ["Nước mắm Vị Ngư", "Nước mắm", "assets/img/vi-ngu-1.webp"],
    "nhi-ngu": [
      "Nước mắm Nhĩ Ngư",
      "Nước mắm",
      "https://acooki.com/uploads/source/header/baner-nuoc-mam-nhi-ngu-17-12.jpg",
    ],
    "hat-nem": ["Hạt nêm Acook", "Hạt nêm", "assets/img/hat-nem-1.webp"],
    "hat-nem-chay": ["Hạt nêm chay nấm", "Hạt nêm", "assets/img/hat-nem-chay-1.webp"],
    "bao-lon": ["Hạt nêm bao lớn 5kg - 10kg", "Hạt nêm", "assets/img/bao-lon-1.webp"],
    "nuoc-tuong": ["Nước tương Soya", "Nước tương", "assets/img/nuoc-tuong-1.webp"],
    "sa-te": ["Sa tế Acook", "Sa tế", "assets/img/sa-te-1.webp"],
    "tuong-ot": ["Tương ớt và tương xay", "Tương", "assets/img/tuong-ot-1.webp"],
    "nuoc-giat": ["Nước giặt Amatic 6 trong 1", "Hóa phẩm gia dụng", "assets/img/nuoc-giat-1.webp"],
    "rua-chen": ["Nước rửa chén Chanh", "Hóa phẩm gia dụng", "assets/img/rua-chen-1.webp"],
  };
  const read = () => {
    try {
      const a = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(a) ? a.filter((k) => P[k]) : [];
    } catch (e) {
      return [];
    }
  };
  const write = (a) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(a.slice(0, 8)));
    } catch (e) {}
  };
  const push = (id) => {
    if (!P[id]) return;
    const a = read().filter((k) => k !== id);
    a.unshift(id);
    write(a);
  };

  // ghi nhận trên trang sản phẩm: xem đủ lâu hoặc mở ảnh
  const arts = $$("article.prod[id]");
  if (arts.length) {
    const timers = new Map();
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          const id = e.target.id;
          if (e.isIntersecting) {
            timers.set(
              id,
              setTimeout(() => {
                push(id);
                renderAll();
              }, 1500),
            );
          } else clearTimeout(timers.get(id));
        }),
      { threshold: 0.55 },
    );
    arts.forEach((a) => {
      io.observe(a);
      $$(".gal-main, .gt, .actions a", a).forEach((el) =>
        el.addEventListener("click", () => {
          push(a.id);
          renderAll();
        }),
      );
    });
  }

  const card = (id, i) => {
    const [name, cat, img] = P[id];
    return (
      '<a class="rv-card" href="san-pham.html#' +
      id +
      '"><span class="rv-pic"><img src="' +
      img +
      '" alt="" loading="lazy" /></span><span class="rv-cat">' +
      cat +
      '</span><span class="rv-name">' +
      name +
      "</span></a>"
    );
  };

  function renderAll() {
    $$("[data-rv]").forEach((slot) => {
      const mode = slot.dataset.rv; // "home" | "list"
      const seen = read();
      let ids = seen,
        title = "Sản phẩm bạn vừa xem",
        sub = "Xem lại nhanh những sản phẩm bạn đã mở trên trang này.",
        clear = true;
      if (!seen.length) {
        if (mode === "list") {
          slot.hidden = true;
          return;
        }
        ids = ["vi-ngu", "hat-nem", "nuoc-tuong", "sa-te"];
        title = "Gợi ý cho bạn";
        sub = "Những sản phẩm quen thuộc trong gian bếp Việt. Sản phẩm bạn xem sẽ hiện ở đây.";
        clear = false;
      }
      slot.hidden = false;
      slot.innerHTML =
        '<div class="rv-head"><div><h2>' +
        title +
        '</h2><p class="rv-sub">' +
        sub +
        "</p></div>" +
        (clear
          ? '<button type="button" class="rv-clear">Xóa lịch sử</button>'
          : "") +
        '</div><div class="rv-rail">' +
        ids.map(card).join("") +
        "</div>";
      const c = $(".rv-clear", slot);
      c &&
        c.addEventListener("click", () => {
          write([]);
          renderAll();
        });
    });
  }
  renderAll();
})();
