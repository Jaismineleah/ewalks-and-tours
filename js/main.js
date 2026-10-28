(function () {
  "use strict";

  var WHATSAPP_NUMBER = "254740540918";
  var EMAIL = "jaismineleah@gmail.com";

  /* ---------- Helpers ---------- */
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function waLink(message) {
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
  }

  var today = new Date();
  var isoToday = today.toISOString().split("T")[0];
  ["searchDate", "date"].forEach(function (id) {
    var input = document.getElementById(id);
    if (input) input.min = isoToday;
  });

  /* ---------- Mobile navigation ---------- */
  var nav = $("#primaryNav");
  var navToggle = $("#navToggle");

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("no-scroll");
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      document.body.classList.toggle("no-scroll", isOpen);
    });

    $all("a", nav).forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(event.target) || navToggle.contains(event.target)) return;
      closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* ---------- Sticky header + back to top ---------- */
  var header = $("#siteHeader");
  var toTop = $("#toTop");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-stuck", y > 10);
    if (toTop) toTop.classList.toggle("is-visible", y > 600);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  var navLinks = $all(".nav ul a");
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href");
      return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (section) {
      navObserver.observe(section);
    });
  }

  /* ---------- Tour filtering ---------- */
  var tourCards = $all(".tour-card");
  var chips = $all(".chip");
  var emptyState = $("#toursEmpty");

  function applyFilter(category) {
    var visible = 0;

    tourCards.forEach(function (card) {
      var match = category === "all" || card.getAttribute("data-category") === category;
      card.classList.toggle("is-hidden", !match);
      if (match) visible += 1;
    });

    chips.forEach(function (chip) {
      var active = chip.getAttribute("data-filter") === category;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-selected", String(active));
    });

    if (emptyState) emptyState.hidden = visible > 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      applyFilter(chip.getAttribute("data-filter"));
    });
  });

  $all("[data-filter]", document).forEach(function (el) {
    if (el.classList.contains("chip") || el.classList.contains("tour-card")) return;
    el.addEventListener("click", function () {
      applyFilter(el.getAttribute("data-filter"));
    });
  });

  /* ---------- Hero search ---------- */
  var destinationCategory = {
    "Nairobi National Park": "Safari",
    "Giraffe Centre": "Family",
    "Karen & Ngong": "Culture",
    "Lake Naivasha": "Day Trips",
    "Nairobi City Centre": "City Tours"
  };

  var searchBtn = $("#searchBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", function () {
      var destination = $("#searchDestination").value;
      var category = destinationCategory[destination] || "all";
      applyFilter(category);
    });
  }

  /* ---------- Favourite hearts ---------- */
  $all(".tour-card__fav").forEach(function (button) {
    button.addEventListener("click", function () {
      var pressed = button.getAttribute("aria-pressed") === "true";
      button.setAttribute("aria-pressed", String(!pressed));
      button.setAttribute("aria-label", (pressed ? "Save " : "Remove ") + (button.closest(".tour-card").querySelector("h3").textContent || "tour"));
    });
  });

  /* ---------- Gallery lightbox ---------- */
  var galleryItems = $all(".gallery-item");
  var lightbox = $("#lightbox");
  var lbImage = $("#lbImage");
  var lbCaption = $("#lbCaption");
  var lbClose = $("#lbClose");
  var lbPrev = $("#lbPrev");
  var lbNext = $("#lbNext");
  var currentIndex = 0;
  var lastFocused = null;

  function showImage(index) {
    if (!galleryItems.length) return;
    currentIndex = (index + galleryItems.length) % galleryItems.length;
    var item = galleryItems[currentIndex];
    var source = item.getAttribute("data-src");
    lbImage.src = source;
    lbImage.alt = item.getAttribute("data-caption") || "Tour photo";
    lbCaption.textContent = item.getAttribute("data-caption") || "";
  }

  function openLightbox(index) {
    if (!lightbox) return;
    lastFocused = document.activeElement;
    showImage(index);
    lightbox.hidden = false;
    document.body.classList.add("no-scroll");
    lbClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.classList.remove("no-scroll");
    lbImage.src = "";
    if (lastFocused) lastFocused.focus();
  }

  galleryItems.forEach(function (item, index) {
    item.addEventListener("click", function () {
      openLightbox(index);
    });
  });

  if (lightbox) {
    lbClose.addEventListener("click", closeLightbox);
    lbPrev.addEventListener("click", function () {
      showImage(currentIndex - 1);
    });
    lbNext.addEventListener("click", function () {
      showImage(currentIndex + 1);
    });
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (event) {
      if (lightbox.hidden) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showImage(currentIndex - 1);
      if (event.key === "ArrowRight") showImage(currentIndex + 1);
    });
  }

  /* ---------- Contact form ---------- */
  var form = $("#contactForm");
  var formNote = $("#formNote");
  var emailInstead = $("#emailInstead");

  function readForm() {
    return {
      name: $("#name").value.trim(),
      phone: $("#phone").value.trim(),
      email: $("#email").value.trim(),
      tour: $("#tour").value,
      date: $("#date").value,
      message: $("#message").value.trim()
    };
  }

  function validate(data) {
    var errors = [];
    if (!data.name) {
      errors.push("Please enter your name.");
      $("#name").classList.add("is-invalid");
    } else {
      $("#name").classList.remove("is-invalid");
    }
    if (!data.phone && !data.email) {
      errors.push("Please add a phone number or an email so we can reply.");
      $("#phone").classList.add("is-invalid");
      $("#email").classList.add("is-invalid");
    } else {
      $("#phone").classList.remove("is-invalid");
      $("#email").classList.remove("is-invalid");
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push("That email address doesn't look right.");
      $("#email").classList.add("is-invalid");
    }
    return errors;
  }

  function buildMessage(data) {
    var lines = [
      "Hello E Walks And Tours! I'd like to request a tour quote.",
      "",
      "Name: " + (data.name || "-"),
      "Phone: " + (data.phone || "-"),
      "Email: " + (data.email || "-"),
      "Tour: " + data.tour,
      "Preferred date: " + (data.date || "flexible")
    ];
    if (data.message) lines.push("", "Message: " + data.message);
    return lines.join("\n");
  }

  function flash(message) {
    if (!formNote) return;
    formNote.textContent = message;
    window.setTimeout(function () {
      formNote.textContent = "";
    }, 6000);
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = readForm();
      var errors = validate(data);

      if (errors.length) {
        flash(errors[0]);
        return;
      }

      flash("Opening WhatsApp with your enquiry...");
      window.open(waLink(buildMessage(data)), "_blank", "noopener");
    });

    if (emailInstead) {
      emailInstead.addEventListener("click", function () {
        var data = readForm();
        var errors = validate(data);
        if (errors.length) {
          flash(errors[0]);
          return;
        }
        var subject = "Tour enquiry - " + data.tour;
        window.location.href =
          "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(buildMessage(data));
        flash("Opening your email app...");
      });
    }
  }

  /* ---------- Scroll reveal ---------- */
  var revealTargets = $all(
    ".section-head, .category-card, .tour-card, .feature, .why__intro, .about__media, .about__copy, .gallery-item, .testimonial, .cta__inner, .contact__copy, .contact-form, .footer__brand, .footer__col"
  );

  if ("IntersectionObserver" in window) {
    revealTargets.forEach(function (el, index) {
      el.classList.add("reveal");
      el.style.transitionDelay = (index % 6) * 55 + "ms";
    });

    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    revealTargets.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ---------- Footer year ---------- */
  var year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
