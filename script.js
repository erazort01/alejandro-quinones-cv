const body = document.body;
const root = document.documentElement;
const revealItems = document.querySelectorAll(".reveal");
const languageButtons = document.querySelectorAll(".language-button");
const progressBar = document.querySelector(".progress-bar");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section[id], .contact-section[id]");
const metricValues = document.querySelectorAll(".metric-value[data-count]");
const hero = document.querySelector(".hero");
const contactForm = document.querySelector(".contact-form");
const submitButton = contactForm ? contactForm.querySelector(".submit-button") : null;
const toastStack = document.querySelector(".toast-stack");
const metaDescription = document.querySelector('meta[name="description"]');

const copy = {
  es: {
    title: "Alejandro Qui\u00f1ones Villar | IT Operations Lead",
    description: "Perfil profesional de Alejandro Qui\u00f1ones Villar, IT Operations Lead enfocado en liderazgo operativo, incident management y delivery internacional en banca y fintech.",
    toastSuccessTitle: "Mensaje enviado correctamente",
    toastSuccessBody: "Gracias por escribir. Si no recibes respuesta ahora, no hace falta reenviarlo.",
    toastErrorTitle: "Ha habido un problema al enviar el mensaje",
    toastErrorBody: "Intentalo de nuevo en un rato.",
    toastClose: "Cerrar notificacion"
  },
  en: {
    title: "Alejandro Quinones Villar | IT Operations Lead",
    description: "Professional profile of Alejandro Quinones Villar, an IT Operations Lead focused on operational leadership, incident management, and international delivery in banking and fintech.",
    toastSuccessTitle: "Message sent successfully",
    toastSuccessBody: "Thanks for reaching out. If you do not get a response right away, there is no need to send it again.",
    toastErrorTitle: "There was a problem sending the message",
    toastErrorBody: "Please try again in a little while.",
    toastClose: "Close notification"
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

  updateVisibleToasts();
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

function toastContent(type) {
  const language = body.dataset.lang || "es";

  if (type === "error") {
    return {
      title: copy[language].toastErrorTitle,
      body: copy[language].toastErrorBody
    };
  }

  return {
    title: copy[language].toastSuccessTitle,
    body: copy[language].toastSuccessBody
  };
}

function removeToast(toast) {
  if (!toast || toast.dataset.closing === "true") {
    return;
  }

  toast.dataset.closing = "true";
  toast.classList.remove("is-visible");
  window.setTimeout(() => {
    toast.remove();
  }, 220);
}

function updateVisibleToasts() {
  if (!toastStack) {
    return;
  }

  toastStack.querySelectorAll(".toast").forEach((toast) => {
    const content = toastContent(toast.dataset.type);
    const title = toast.querySelector(".toast-title");
    const bodyCopy = toast.querySelector(".toast-copy");
    const closeButton = toast.querySelector(".toast-close");

    if (title) {
      title.textContent = content.title;
    }

    if (bodyCopy) {
      bodyCopy.textContent = content.body;
    }

    if (closeButton) {
      closeButton.setAttribute("aria-label", copy[body.dataset.lang || "es"].toastClose);
    }
  });
}

function showToast(type) {
  if (!toastStack) {
    return;
  }

  toastStack.querySelectorAll(".toast").forEach((toast) => removeToast(toast));

  const content = toastContent(type);
  const toast = document.createElement("section");
  toast.className = `toast toast--${type}`;
  toast.dataset.type = type;
  toast.setAttribute("role", type === "error" ? "alert" : "status");

  const title = document.createElement("p");
  title.className = "toast-title";
  title.textContent = content.title;

  const bodyCopy = document.createElement("p");
  bodyCopy.className = "toast-copy";
  bodyCopy.textContent = content.body;

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "toast-close";
  closeButton.setAttribute("aria-label", copy[body.dataset.lang || "es"].toastClose);
  closeButton.textContent = "×";

  closeButton.addEventListener("click", () => {
    removeToast(toast);
  });

  toast.append(title, bodyCopy, closeButton);
  toastStack.append(toast);

  window.requestAnimationFrame(() => {
    toast.classList.add("is-visible");
  });

  window.setTimeout(() => {
    removeToast(toast);
  }, 30000);
}

function setupContactForm() {
  if (!contactForm || !submitButton) {
    return;
  }

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    submitButton.disabled = true;
    submitButton.classList.add("is-loading");
    contactForm.setAttribute("aria-busy", "true");

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: {
          Accept: "application/json"
        }
      });

      let payload = null;
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        payload = await response.json();
      }

      if (!response.ok || (payload && (payload.success === false || payload.success === "false"))) {
        throw new Error("form-submit-error");
      }

      contactForm.reset();
      showToast("success");
    } catch (error) {
      showToast("error");
    } finally {
      submitButton.disabled = false;
      submitButton.classList.remove("is-loading");
      contactForm.removeAttribute("aria-busy");
    }
  });
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
setupContactForm();
updateProgressBar();

window.addEventListener("scroll", updateProgressBar, { passive: true });
