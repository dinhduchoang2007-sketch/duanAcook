/* ACOOKI VIP LAYER — hiệu ứng & tương tác cao cấp */
(() => {
  const $ = (s, r = document) => r.querySelector(s),
    $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const root = document.documentElement;
  root.classList.add("js");

  /* ---------- preloader (chỉ lần đầu mỗi phiên) ---------- */
  let seen = false;
  try {
    seen = sessionStorage.getItem("acooki-pre") === "1";
    sessionStorage.setItem("acooki-pre", "1");
  } catch (e) {}
  if (!reduce && !seen) {
    const p = document.createElement("div");
    p.className = "pre";
    p.setAttribute("aria-hidden", "true");
    p.innerHTML =
      '<div class="pre-in"><div class="pre-word">Acooki</div><div class="pre-bar"><i></i></div></div>';
    document.body.prepend(p);
    const hide = () => p.classList.add("done");
    setTimeout(hide, 1150);
    setTimeout(() => p.remove(), 2200);
  }

  /* ---------- thanh tiến trình cuộn ---------- */
  const prog = document.createElement("div");
  prog.className = "prog";
  document.body.prepend(prog);
  const steps = $(".steps");
  const onScroll = () => {
    const h = root.scrollHeight - innerHeight;
    prog.style.transform = "scaleX(" + (h > 0 ? scrollY / h : 0) + ")";
    if (steps) {
      const r = steps.getBoundingClientRect();
      const p = Math.min(
        1,
        Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + 80)),
      );
      steps.style.setProperty("--p", p.toFixed(3));
    }
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- hero ---------- */
  const hero = $(".hero");
  if (hero) {
    // tiêu đề: tách dòng, dòng cuối chữ vàng nghiêng
    $$(".hero h2").forEach((h) => {
      const w = h.textContent.trim().split(/\s+/);
      const cut = w.length > 2 ? w.length - 1 : 1;
      const a = w.slice(0, cut).join(" "),
        b = w.slice(cut).join(" ");
      h.innerHTML =
        '<span class="ln"><span>' +
        a +
        '</span></span><span class="ln"><span><em>' +
        b +
        "</em></span></span>";
    });

    // bộ đếm + mũi tên
    const slides = $$(".slide", hero),
      hn = $$(".hn", hero);
    const ctr = document.createElement("div");
    ctr.className = "hero-ctr";
    ctr.innerHTML =
      '<span class="n">01</span><span class="t">/ 0' +
      slides.length +
      '</span><span class="arr"><button type="button" aria-label="Slide trước"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><button type="button" aria-label="Slide sau"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button></span>';
    hero.appendChild(ctr);
    const cue = document.createElement("div");
    cue.className = "scue";
    cue.setAttribute("aria-hidden", "true");
    hero.appendChild(cue);
    let cur = 0;
    const [pv, nx] = $$("button", ctr);
    pv.addEventListener("click", () =>
      hn[(cur + slides.length - 1) % slides.length].click(),
    );
    nx.addEventListener("click", () => hn[(cur + 1) % slides.length].click());
    document.addEventListener("slide", (e) => {
      cur = e.detail;
      $(".n", ctr).textContent = "0" + (cur + 1);
    });
    // vuốt trên mobile
    let sx = 0;
    hero.addEventListener(
      "touchstart",
      (e) => (sx = e.touches[0].clientX),
      { passive: true },
    );
    hero.addEventListener(
      "touchend",
      (e) => {
        const d = e.changedTouches[0].clientX - sx;
        if (Math.abs(d) > 50) (d < 0 ? nx : pv).click();
      },
      { passive: true },
    );

    // hạt "muối biển / đốm hổ phách" bay lên
    if (!reduce) {
      const cv = document.createElement("canvas");
      cv.className = "fx";
      cv.setAttribute("aria-hidden", "true");
      hero.insertBefore(cv, ctr);
      const cx = cv.getContext("2d");
      let W,
        H,
        ps = [],
        run = true;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const mk = (init) => ({
        x: Math.random() * W,
        y: init ? Math.random() * H : H + 10,
        r: Math.random() * 2.2 + 0.4,
        v: Math.random() * 0.45 + 0.12,
        d: Math.random() * Math.PI * 2,
        a: Math.random() * 0.5 + 0.15,
        g: Math.random() > 0.55,
      });
      const size = () => {
        W = cv.clientWidth;
        H = cv.clientHeight;
        cv.width = W * dpr;
        cv.height = H * dpr;
        cx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const n = Math.round(Math.min(70, W / 18));
        ps = Array.from({ length: n }, () => mk(true));
      };
      size();
      addEventListener("resize", size);
      new IntersectionObserver(([e]) => {
        run = e.isIntersecting;
        if (run) tick();
      }).observe(hero);
      let mx = -999,
        my = -999;
      hero.addEventListener("mousemove", (e) => {
        const b = hero.getBoundingClientRect();
        mx = e.clientX - b.left;
        my = e.clientY - b.top;
      });
      hero.addEventListener("mouseleave", () => (mx = my = -999));
      const tick = () => {
        if (!run) return;
        cx.clearRect(0, 0, W, H);
        for (const p of ps) {
          p.y -= p.v;
          p.d += 0.01;
          p.x += Math.sin(p.d) * 0.35;
          const dx = p.x - mx,
            dy = p.y - my,
            q = dx * dx + dy * dy;
          if (q < 14000) {
            const f = (1 - q / 14000) * 1.6;
            p.x += (dx / Math.sqrt(q + 1)) * f;
            p.y += (dy / Math.sqrt(q + 1)) * f;
          }
          if (p.y < -10) Object.assign(p, mk(false));
          cx.beginPath();
          cx.arc(p.x, p.y, p.r, 0, 6.283);
          cx.fillStyle = p.g
            ? "rgba(232,169,74," + p.a + ")"
            : "rgba(255,255,255," + p.a * 0.7 + ")";
          cx.shadowColor = p.g ? "rgba(232,169,74,.9)" : "transparent";
          cx.shadowBlur = p.g ? 10 : 0;
          cx.fill();
        }
        requestAnimationFrame(tick);
      };
      tick();
    }

    // parallax nhẹ cho nội dung hero khi cuộn
    if (!reduce)
      addEventListener(
        "scroll",
        () => {
          if (scrollY < innerHeight) {
            const y = scrollY;
            $$(".hero-in", hero).forEach(
              (el) => (el.style.transform = "translateY(" + y * 0.12 + "px)"),
            );
          }
        },
        { passive: true },
      );
  }

  /* ---------- marquee: nhân đôi nội dung để chạy liền mạch ---------- */
  $$(".mq-t").forEach((t) => {
    t.innerHTML += t.innerHTML;
    t.setAttribute("aria-hidden", "true");
  });

  /* ---------- reveal khi cuộn ---------- */
  const sel = [
    [".facts dl > div", "rv z"],
    [".sec-head", "rv"],
    [".split > div:first-child", "rv l"],
    [".split > .frame, .split > .pic, .split > div:last-child:not(:first-child)", "rv r"],
    [".values li", "rv"],
    [".tile", "rv"],
    [".step", "rv"],
    [".panel", "rv"],
    [".vid-wrap > *", "rv"],
    [".post", "rv"],
    [".faq > *", "rv"],
    [".logos > *", "rv z"],
    [".cta .wrap > *", "rv"],
    [".doc, .ci, .prod .split > *, .jump, form.card, .map", "rv"],
    ["footer .g > *", "rv"],
  ];
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
  );
  sel.forEach(([s, c]) => {
    $$(s).forEach((el, i) => {
      if (el.classList.contains("rv")) return;
      el.classList.add(...c.split(" "));
      el.style.setProperty("--d", (i % 4) * 0.09 + "s");
      io.observe(el);
    });
  });

  /* ---------- đếm số ---------- */
  const cnt = (el) => {
    const n = parseInt(el.textContent, 10);
    if (isNaN(n) || reduce) return;
    const t0 = performance.now(),
      D = 1400;
    const f = (t) => {
      const k = Math.min(1, (t - t0) / D),
        e = 1 - Math.pow(1 - k, 4);
      el.textContent = Math.round(n * e);
      if (k < 1) requestAnimationFrame(f);
    };
    el.textContent = "0";
    requestAnimationFrame(f);
  };
  const cio = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          cnt(e.target);
          cio.unobserve(e.target);
        }
      }),
    { threshold: 0.6 },
  );
  $$(".facts dt").forEach((d) => cio.observe(d));

  /* ---------- thẻ sản phẩm: 3D tilt + ánh sáng theo chuột ---------- */
  $$(".tile").forEach((t) => {
    const bgi = document.createElement("span"),
      gl = document.createElement("span");
    bgi.className = "bgi";
    gl.className = "glow";
    t.prepend(gl);
    t.prepend(bgi);
    if (!fine || reduce) return;
    t.addEventListener("mousemove", (e) => {
      const b = t.getBoundingClientRect(),
        x = (e.clientX - b.left) / b.width,
        y = (e.clientY - b.top) / b.height;
      t.style.transform =
        "rotateY(" +
        (x - 0.5) * 9 +
        "deg) rotateX(" +
        (0.5 - y) * 9 +
        "deg) translateY(-6px)";
      t.style.setProperty("--mx", x * 100 + "%");
      t.style.setProperty("--my", y * 100 + "%");
    });
    t.addEventListener("mouseleave", () => (t.style.transform = ""));
  });

  /* ---------- khung ảnh nghiêng nhẹ ---------- */
  if (fine && !reduce)
    $$(".frame").forEach((f) => {
      f.addEventListener("mousemove", (e) => {
        const b = f.getBoundingClientRect();
        f.style.transform =
          "perspective(900px) rotateY(" +
          ((e.clientX - b.left) / b.width - 0.5) * 8 +
          "deg) rotateX(" +
          (0.5 - (e.clientY - b.top) / b.height) * 8 +
          "deg)";
      });
      f.addEventListener("mouseleave", () => (f.style.transform = ""));
    });

  /* ---------- nút "từ tính" ---------- */
  if (fine && !reduce)
    $$(".btn").forEach((b) => {
      b.addEventListener("mousemove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.translate =
          (e.clientX - r.left - r.width / 2) * 0.18 +
          "px " +
          (e.clientY - r.top - r.height / 2) * 0.28 +
          "px";
      });
      b.addEventListener("mouseleave", () => (b.style.translate = ""));
    });

  /* ---------- FAQ: tự đóng mục khác trong cùng nhóm ---------- */
  $$(".q > button").forEach((b) =>
    b.addEventListener("click", () => {
      const q = b.parentElement;
      if (!q.classList.contains("on")) return;
      $$(".q.on", q.parentElement).forEach((o) => {
        if (o !== q) {
          o.classList.remove("on");
          $("button", o).setAttribute("aria-expanded", "false");
        }
      });
    }),
  );

  /* ---------- thư viện ảnh + lightbox ---------- */
  const gals = $$(".gal");
  if (gals.length || $(".cert")) {
    const lb = document.createElement("div");
    lb.className = "lb";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Xem ảnh sản phẩm");
    lb.innerHTML =
      '<button class="x" aria-label="Đóng">×</button><button class="pv" aria-label="Ảnh trước">‹</button><img alt="" /><button class="nx" aria-label="Ảnh sau">›</button><div class="ct"></div>';
    document.body.appendChild(lb);
    let list = [],
      k = 0,
      opener = null;
    const show = (n) => {
      k = (n + list.length) % list.length;
      $("img", lb).src = list[k].src;
      $("img", lb).alt = list[k].alt;
      $(".ct", lb).textContent = k + 1 + " / " + list.length;
      lb.classList.toggle("one", list.length < 2);
      $(".pv", lb).style.display = $(".nx", lb).style.display =
        list.length < 2 ? "none" : "";
    };
    const close = () => {
      lb.classList.remove("on");
      document.body.style.overflow = "";
      opener && opener.focus();
    };
    gals.forEach((g) => {
      const main = $("button.gal-main", g),
        mi = main && $("img", main),
        ts = $$(".gt", g);
      if (!main) return;
      const srcs = ts.length
        ? ts.map((t) => $("img", t).src)
        : [mi.src];
      const set = (n) => {
        ts.forEach((t, j) => t.classList.toggle("on", j === n));
        main.classList.add("sw");
        setTimeout(() => {
          mi.src = srcs[n];
          main.classList.remove("sw");
        }, 180);
        main.dataset.i = n;
      };
      ts.forEach((t, j) => t.addEventListener("click", () => set(j)));
      main.addEventListener("click", () => {
        opener = main;
        list = srcs.map((s) => ({ src: s, alt: mi.alt }));
        show(+(main.dataset.i || 0));
        lb.classList.add("on");
        document.body.style.overflow = "hidden";
        $(".x", lb).focus();
      });
    });
    $(".x", lb).addEventListener("click", close);
    $(".pv", lb).addEventListener("click", () => show(k - 1));
    $(".nx", lb).addEventListener("click", () => show(k + 1));
    lb.addEventListener("click", (e) => e.target === lb && close());
    addEventListener("keydown", (e) => {
      if (!lb.classList.contains("on")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(k - 1);
      if (e.key === "ArrowRight") show(k + 1);
    });
  }

  /* ---------- chuyển trang mượt ---------- */
  if (!reduce)
    $$('a[href$=".html"], a[href*=".html#"]').forEach((a) =>
      a.addEventListener("click", (e) => {
        const u = new URL(a.href, location.href);
        if (
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          a.target ||
          u.origin !== location.origin ||
          u.pathname === location.pathname
        )
          return;
        e.preventDefault();
        document.body.style.transition = "opacity .35s";
        document.body.style.opacity = "0";
        setTimeout(() => (location.href = a.href), 330);
      }),
    );
  addEventListener("pageshow", (e) => {
    if (e.persisted) document.body.style.opacity = "";
  });
})();

/* ===== TÌM KIẾM TOÀN SITE + TIN TỨC + CHỨNG NHẬN ===== */
(() => {
  const $ = (s, r = document) => r.querySelector(s),
    $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const norm = (s) =>
    s
      .toLowerCase()
      .replace(/đ/g, "d")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");

  /* ---- chỉ mục tìm kiếm ---- */
  const A = "https://acooki.com/";
  const IDX = [
    ["Sản phẩm", "Nước mắm Vị Ngư", "san-pham.html#vi-ngu", "nuoc mam chai 750ml 900ml can 4,8l ca com chuot"],
    ["Sản phẩm", "Nước mắm Nhĩ Ngư", "san-pham.html#nhi-ngu", "nuoc mam nhi mam nhi ca com hổ phách"],
    ["Sản phẩm", "Hạt nêm Acook", "san-pham.html#hat-nem", "hat nem thit xuong ham 3 trong 1 betacarotene 900g"],
    ["Sản phẩm", "Hạt nêm chay nấm Acook", "san-pham.html#hat-nem-chay", "hat nem chay nam organic 200gr 900gr"],
    ["Sản phẩm", "Hạt nêm bao lớn 5kg - 10kg", "san-pham.html#bao-lon", "hat nem bao lon bep an quan an tap the"],
    ["Sản phẩm", "Nước tương Soya", "san-pham.html#nuoc-tuong", "nuoc tuong xi dau dau nanh soya 500ml 4,8l"],
    ["Sản phẩm", "Sa tế Acook", "san-pham.html#sa-te", "sa te cay sa te tom ot toi"],
    ["Sản phẩm", "Tương ớt và tương xay", "san-pham.html#tuong-ot", "tuong ot tuong xay tuong cham"],
    ["Sản phẩm", "Nước giặt Amatic 6 trong 1", "san-pham.html#nuoc-giat", "nuoc giat xa tb foods hoa pham gia dung"],
    ["Sản phẩm", "Nước rửa chén Chanh", "san-pham.html#rua-chen", "nuoc rua chen chanh 3 in 1 tb foods hoa pham gia dung"],
    ["Trang", "Giới thiệu Acooki", "gioi-thieu.html", "ve chung toi quy trinh san xuat 8 buoc nha may cu chi"],
    ["Hồ sơ", "Chứng nhận HACCP CODEX 2022", "chung-nhan.html#tan-binh", "haccp nac 202530185 giay chung nhan an toan thuc pham"],
    ["Hồ sơ", "Hồ sơ công bố Nước chấm Vị Ngư", "chung-nhan.html#nuoc-cham", "tu cong bo san pham so 07 nuoc cham"],
    ["Hồ sơ", "Hồ sơ công bố Nước tương Soya", "chung-nhan.html#nuoc-tuong-soya", "tu cong bo san pham so 13 xi dau"],
    ["Hồ sơ", "Hồ sơ công bố Sa tế cay", "chung-nhan.html#sa-te-cay", "tu cong bo san pham so 11"],
    ["Hồ sơ", "Hồ sơ công bố Sa tế tôm", "chung-nhan.html#sa-te-tom", "tu cong bo san pham so 12"],
    ["Hồ sơ", "Hồ sơ công bố Tương ớt", "chung-nhan.html#tuong-ot", "tu cong bo san pham so 04"],
    ["Hồ sơ", "Hồ sơ công bố Tương xay", "chung-nhan.html#tuong-xay", "tu cong bo san pham so 03"],
    ["Hồ sơ", "Tiêu chuẩn cơ sở Nước giặt xả Amatic", "chung-nhan.html#nuoc-giat-444", "tccs 444 tieu chuan co so"],
    ["Hồ sơ", "Tiêu chuẩn cơ sở Nước rửa chén", "chung-nhan.html#nuoc-rua-chen-777", "tccs 777 tieu chuan co so"],
    ["Trang", "Chứng nhận & hồ sơ pháp lý", "chung-nhan.html", "chung nhan giay phep phap ly cong bo san pham an toan thuc pham"],
    ["Trang", "Tin tức", "tin-tuc.html", "bai viet kien thuc nuoc mam"],
    ["Trang", "Liên hệ - Làm đại lý / NPP", "lien-he.html", "dai ly nha phan phoi gia cong hotline 0966220012 dia chi"],
    ["Trang", "Gia công nước mắm độc quyền", "lien-he.html", "oem gia cong thuong hieu rieng"],
    ["Tin tức", "Tổng hợp những món ngon Việt Nam không thể thiếu nước mắm", A + "tong-hop-nhung-mon-ngon-viet-nam-khong-the-che-bien-thieu-nuoc-mam", "am thuc mon ngon uop nem"],
    ["Tin tức", "Gia công nước mắm độc quyền: chớp thời cơ", A + "gia-cong-nuoc-mam-doc-quyen-chop-thoi-co-tro-thanh-thuong-hieu-nuoc-mam-hang-dau", "gia cong oem thuong hieu"],
    ["Tin tức", "Xu hướng thị trường nước mắm Việt Nam", A + "xu-huong-thi-truong-nuoc-mam-viet-nam-co-hoi-thach-thuc", "thi truong co hoi thach thuc"],
    ["Tin tức", "Nước mắm cá cơm: hương vị truyền thống và giá trị dinh dưỡng", A + "nuoc-mam-ca-com-huong-vi-truyen-thong-va-gia-tri-dinh-duong", "ca com dinh duong"],
    ["Tin tức", "Quy trình sản xuất nước mắm", A + "quy-trinh-san-xuat-nuoc-mam-hanh-trinh-tu-bien-ca-tro-thanh-mon-gia-vi-khong-the-thieu-cua-nguoi-viet", "u chuop quy trinh san xuat"],
  ].map((r) => ({ t: r[0], n: r[1], u: r[2], k: norm(r[1] + " " + r[3]), nn: norm(r[1]) }));

  /* ---- nút tìm kiếm trên header ---- */
  const bar = $(".nav-bar");
  if (bar) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sbtn";
    b.setAttribute("aria-label", "Tìm kiếm (phím /)");
    b.innerHTML =
      '<svg class="ico" aria-hidden="true"><use href="#i-search" /></svg><span class="sbtn-t">Tìm kiếm</span><kbd>/</kbd>';
    const cta = $(".nav-cta", bar);
    bar.insertBefore(b, cta || $(".burger", bar));
    b.addEventListener("click", open);
  }

  /* ---- overlay ---- */
  const ov = document.createElement("div");
  ov.className = "sov";
  ov.setAttribute("role", "dialog");
  ov.setAttribute("aria-modal", "true");
  ov.setAttribute("aria-label", "Tìm kiếm");
  ov.innerHTML =
    '<div class="sbox"><div class="sin"><svg class="ico" aria-hidden="true"><use href="#i-search" /></svg><input type="search" placeholder="Tìm sản phẩm, bài viết, trang..." aria-label="Từ khóa" autocomplete="off" /><button type="button" class="sx" aria-label="Đóng">Esc</button></div><div class="sres" role="listbox"></div></div>';
  document.body.appendChild(ov);
  const inp = $("input", ov),
    res = $(".sres", ov);
  let items = [],
    cur = -1;
  const hl = (n, q) => {
    if (!q) return n;
    const nn = norm(n),
      i = nn.indexOf(q);
    return i < 0
      ? n
      : n.slice(0, i) +
          "<mark>" +
          n.slice(i, i + q.length) +
          "</mark>" +
          n.slice(i + q.length);
  };
  function render() {
    const q = norm(inp.value.trim());
    let list;
    if (!q) {
      list = IDX.filter((x) => x.t !== "Tin tức").slice(0, 8);
    } else {
      const ws = q.split(/\s+/);
      list = IDX.filter((x) => ws.every((w) => x.k.includes(w)))
        .map((x) => ({
          x,
          s: (x.nn.includes(q) ? 10 : 0) + ws.filter((w) => x.nn.includes(w)).length,
        }))
        .sort((a, b) => b.s - a.s)
        .map((o) => o.x)
        .slice(0, 12);
    }
    items = list;
    cur = list.length ? 0 : -1;
    if (!list.length) {
      res.innerHTML =
        '<p class="snone">Không có kết quả cho "<b>' +
        inp.value.replace(/</g, "&lt;") +
        '</b>". Thử "nước mắm", "hạt nêm" hoặc "đại lý".</p>';
      return;
    }
    let html = "",
      last = "";
    list.forEach((x, i) => {
      if (x.t !== last) {
        html += '<div class="sg">' + x.t + "</div>";
        last = x.t;
      }
      const ext = x.u.startsWith("http");
      html +=
        '<a role="option" class="si' +
        (i === 0 ? " on" : "") +
        '" data-i="' +
        i +
        '" href="' +
        x.u +
        '"' +
        (ext ? ' target="_blank" rel="noopener"' : "") +
        "><span>" +
        hl(x.n, q.length > 1 ? q : "") +
        '</span></a>';
    });
    res.innerHTML = html;
  }
  function mark(n) {
    const els = $$(".si", res);
    if (!els.length) return;
    cur = (n + els.length) % els.length;
    els.forEach((e, i) => e.classList.toggle("on", i === cur));
    els[cur].scrollIntoView({ block: "nearest" });
  }
  function open() {
    ov.classList.add("on");
    document.body.style.overflow = "hidden";
    inp.value = "";
    render();
    setTimeout(() => inp.focus(), 30);
  }
  function close() {
    ov.classList.remove("on");
    document.body.style.overflow = "";
  }
  inp.addEventListener("input", render);
  $(".sx", ov).addEventListener("click", close);
  ov.addEventListener("click", (e) => e.target === ov && close());
  res.addEventListener("click", (e) => {
    if (e.target.closest(".si")) close();
  });
  addEventListener("keydown", (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(
      (document.activeElement || {}).tagName || "",
    );
    if (
      !ov.classList.contains("on") &&
      ((e.key === "/" && !typing) || ((e.ctrlKey || e.metaKey) && e.key === "k"))
    ) {
      e.preventDefault();
      open();
      return;
    }
    if (!ov.classList.contains("on")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowDown") (e.preventDefault(), mark(cur + 1));
    else if (e.key === "ArrowUp") (e.preventDefault(), mark(cur - 1));
    else if (e.key === "Enter" && cur >= 0) {
      e.preventDefault();
      const a = $$(".si", res)[cur];
      a && a.click();
      if (a && !a.target) location.href = a.getAttribute("href");
    }
  });

  /* ---- tin tức: lọc theo chủ đề + tìm trong trang ---- */
  const grid = $("#ngrid");
  if (grid) {
    let cat = "";
    const cards = $$(".ncard", grid),
      q = $("#nq"),
      em = $("#nempty");
    const run = () => {
      const k = norm(q.value.trim());
      let n = 0;
      cards.forEach((c) => {
        const ok =
          (!cat || c.dataset.c === cat) && (!k || norm(c.textContent).includes(k));
        c.hidden = !ok;
        if (ok) n++;
      });
      // thẻ đầu tiên đang hiển thị là thẻ nổi bật
      let first = true;
      cards.forEach((c) => {
        const f = !c.hidden && first && !cat && !k;
        c.classList.toggle("feat", f);
        if (!c.hidden) first = false;
      });
      em.hidden = n > 0;
    };
    $$(".chip").forEach((b) =>
      b.addEventListener("click", () => {
        $$(".chip").forEach((x) => x.classList.toggle("on", x === b));
        cat = b.dataset.c;
        run();
      }),
    );
    q.addEventListener("input", run);
  }

  /* ---- chứng nhận: tự nạp bản quét nếu có trong assets/img/chung-nhan/ ---- */
  $$(".cert").forEach((c) => {
    const slug = c.dataset.slug;
    const exts = ["webp", "jpg", "jpeg", "png"];
    const tryLoad = (i) => {
      if (i >= exts.length) return;
      const src = "assets/img/chung-nhan/" + slug + "." + exts[i];
      const im = new Image();
      im.onload = () => {
        const pic = $(".cpic", c);
        pic.innerHTML = "";
        pic.classList.add("has");
        pic.appendChild(im);
        im.alt = c.dataset.title;
        pic.setAttribute("role", "button");
        pic.tabIndex = 0;
        const z = () => {
          const lb = $(".lb");
          if (!lb) return;
          $("img", lb).src = src;
          $(".ct", lb).textContent = c.dataset.title;
          $(".pv", lb).style.display = $(".nx", lb).style.display = "none";
          lb.classList.add("on");
          document.body.style.overflow = "hidden";
        };
        pic.addEventListener("click", z);
        pic.addEventListener("keydown", (e) => e.key === "Enter" && z());
      };
      im.onerror = () => tryLoad(i + 1);
      im.src = src;
    };
    tryLoad(0);
  });
})();
