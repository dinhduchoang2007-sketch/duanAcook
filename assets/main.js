(() => {
  const $ = (s, r = document) => r.querySelector(s),
    $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* mobile nav */
  const bg = $(".burger"),
    nv = $("nav.main");
  const closeNav = () => {
    bg.classList.remove("x");
    nv.classList.remove("open");
    bg.setAttribute("aria-expanded", "false");
  };
  bg &&
    bg.addEventListener("click", () => {
      const o = nv.classList.toggle("open");
      bg.classList.toggle("x", o);
      bg.setAttribute("aria-expanded", o);
    });
  $$("nav.main a").forEach((a) => a.addEventListener("click", closeNav));
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  /* header shadow + back to top */
  const hd = $("header.site"),
    tb = $(".fl .t");
  const onScroll = () => {
    hd.classList.toggle("scrolled", scrollY > 8);
    tb && tb.classList.toggle("on", scrollY > 600);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  tb &&
    tb.addEventListener("click", () =>
      scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }),
    );

  /* hero slider */
  const sl = $$(".slide"),
    hn = $$(".hn");
  if (sl.length) {
    let i = 0,
      t;
    const hero = $(".hero");
    const go = (k) => {
      i = k;
      document.dispatchEvent(new CustomEvent('slide', { detail: k }));
      sl.forEach((s, j) => s.classList.toggle("is-on", j === k));
      hn.forEach((b, j) => {
        b.classList.remove("on");
        if (j === k) {
          void b.offsetWidth;
          b.classList.add("on");
        }
        b.setAttribute("aria-current", j === k);
      });
    };
    const play = () => {
      clearInterval(t);
      if (!reduce) t = setInterval(() => go((i + 1) % sl.length), 6000);
    };
    hn.forEach((b, k) =>
      b.addEventListener("click", () => {
        go(k);
        play();
      }),
    );
    hero.addEventListener("mouseenter", () => {
      clearInterval(t);
      hn.forEach((b) => b.classList.add("paused"));
    });
    hero.addEventListener("mouseleave", () => {
      hn.forEach((b) => b.classList.remove("paused"));
      go(i);
      play();
    });
    go(0);
    play();
  }

  /* faq */
  $$(".q>button").forEach((b) =>
    b.addEventListener("click", () => {
      const q = b.parentElement,
        o = q.classList.toggle("on");
      b.setAttribute("aria-expanded", o);
    }),
  );
  $$(".tabs button").forEach((b) =>
    b.addEventListener("click", () => {
      $$(".tabs button").forEach((x) =>
        x.setAttribute("aria-selected", x === b),
      );
      $$(".fp").forEach((p) => (p.hidden = p.id !== b.dataset.t));
    }),
  );

  /* contact form: opens the visitor's email app with the message filled in */
  const f = $("#cf");
  f &&
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = new FormData(f),
        body = [
          "Họ và tên: " + d.get("name"),
          "Điện thoại: " + d.get("phone"),
          "Email: " + (d.get("email") || "—"),
          "Nhu cầu: " + d.get("need"),
          "",
          "Nội dung:",
          d.get("msg") || "",
        ].join("\n");
      location.href =
        "mailto:asianvietnam.tong@gmail.com?subject=" +
        encodeURIComponent(
          "[Website] " + d.get("need") + " - " + d.get("name"),
        ) +
        "&body=" +
        encodeURIComponent(body);
      $(".ok").classList.add("on");
    });
})();
