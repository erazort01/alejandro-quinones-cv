const body = document.body;
const root = document.documentElement;
const revealItems = document.querySelectorAll(".reveal");
const languageButtons = document.querySelectorAll(".language-button");
const progressBar = document.querySelector(".progress-bar");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section[id], .contact-section[id]");
const metricValues = document.querySelectorAll(".metric-value[data-count]");
const hero = document.querySelector(".hero");
const formNext = document.getElementById("form-next");
const formStatus = document.getElementById("form-status");
const metaDescription = document.querySelector('meta[name="description"]');

const copy = {
  es: {
    title: "Alejandro Qui\u00f1ones Villar | IT Operations Lead",
    description: "Perfil profesional de Alejandro Qui\u00f1ones Villar, IT Operations Lead enfocado en liderazgo operativo, incident management y delivery internacional en banca y fintech.",
    formSuccess: "Mensaje enviado. Si es el primer uso de FormSubmit, revisa el correo de activaci\u00f3n para completar la configuraci\u00f3n."
  },
  en: {
    title: "Alejandro Quinones Villar | IT Operations Lead",
    description: "Professional profile of Alejandro Quinones Villar, an IT Operations Lead focused on operational leadership, incident management, and international delivery in banking and fintech.",
    formSuccess: "Message sent. If this is the first FormSubmit submission, check the activation email to complete setup."
  }
};

function metricSuffixFor(element) {
  return body.dataset.lang === "en"
    ? element.dataset.suffixEn || element.dataset.suffix || ""
    : element.dataset.suffix || "";
}

function renderMetricText(element, value) {
  const prefix = element.dataset.prefix || "";
  const suffix = metricSuffixFor(element);
  element.textContent = `${prefix}${value}${suffix}`;
}

function setLanguage(language) {
  const safeLanguage = language === "en" ? "en" : "es";

  body.dataset.lang = safeLanguage;
  root.lang = safeLanguage;
  document.title = copy[safeLanguage].title;
  metaDescription.setAttribute("content", copy[safeLanguage].description);

  languageButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.language === safeLanguage);
  });

  localStorage.setItem("aqv-language", safeLanguage);

  metricValues.forEach((element) => {
    renderMetricText(element, Number(element.dataset.count));
  });

  if (formStatus && formStatus.dataset.state === "success") {
    formStatus.textContent = copy[safeLanguage].formSuccess;
  }
}

function updateProgressBar() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  progressBar.style.transform = `scaleX(${progress})`;
}

function animateMetric(element) {
  if (element.dataset.animated === "true") {
    return;
  }

  element.dataset.animated = "true";

  const target = Number(element.dataset.count);
  const duration = 1400;
  const startTime = performance.now();

  function frame(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);

    renderMetricText(element, value);

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

function setupReveal() {
  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    metricValues.forEach((item) => animateMetric(item));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");

        if (entry.target.classList.contains("metric-card")) {
          const metric = entry.target.querySelector(".metric-value[data-count]");
          if (metric) {
            animateMetric(metric);
          }
        }

        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

function setupNavigationTracking() {
  if (!("IntersectionObserver" in window)) {
    return;
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    {
      rootMargin: "-40% 0px -45% 0px",
      threshold: 0
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

function setupHeroPointer() {
  if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  hero.addEventListener("pointermove", (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    hero.style.setProperty("--pointer-x", `${x}%`);
    hero.style.setProperty("--pointer-y", `${y}%`);
  });
}

function setupFormState() {
  if (!formNext || !formStatus) {
    return;
  }

  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("sent", "1");
  formNext.value = nextUrl.toString();

  const hasSent = new URLSearchParams(window.location.search).has("sent");
  formStatus.dataset.state = hasSent ? "success" : "idle";
  formStatus.hidden = !hasSent;
  formStatus.textContent = hasSent ? copy[body.dataset.lang].formSuccess : "";

  if (hasSent) {
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete("sent");
    window.history.replaceState({}, "", cleanUrl.toString());
  }
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.language);
  });
});

const savedLanguage = localStorage.getItem("aqv-language");
setLanguage(savedLanguage);
setupReveal();
setupNavigationTracking();
setupHeroPointer();
setupFormState();
updateProgressBar();

window.addEventListener("scroll", updateProgressBar, { passive: true });
