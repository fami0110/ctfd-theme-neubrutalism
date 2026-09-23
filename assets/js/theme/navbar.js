const HIDE_DELAY = 1000;
const TOP_EDGE_ZONE = 28;
const SCROLL_THRESHOLD = 96;

export default () => {
  const navbar = document.querySelector(".navbar");

  if (!navbar) {
    return;
  }

  let hideTimer = null;

  const clearHideTimer = () => {
    if (hideTimer) {
      window.clearTimeout(hideTimer);
      hideTimer = null;
    }
  };

  const showNavbar = () => {
    clearHideTimer();
    navbar.classList.add("is-revealed");
  };

  const scheduleHide = () => {
    clearHideTimer();
    hideTimer = window.setTimeout(() => {
      if (!navbar.matches(":hover") && window.scrollY > SCROLL_THRESHOLD) {
        navbar.classList.remove("is-revealed");
      }
    }, HIDE_DELAY);
  };

  const updateScrollState = () => {
    const isScrolled = window.scrollY > SCROLL_THRESHOLD;
    navbar.classList.toggle("is-scrolled", isScrolled);

    if (!isScrolled) {
      showNavbar();
    } else if (!navbar.matches(":hover")) {
      scheduleHide();
    }
  };

  navbar.addEventListener("mouseenter", showNavbar);
  navbar.addEventListener("mouseleave", scheduleHide);
  window.addEventListener("scroll", updateScrollState, { passive: true });
  window.addEventListener("mousemove", (event) => {
    if (event.clientY <= TOP_EDGE_ZONE) {
      showNavbar();
    } else if (!navbar.matches(":hover") && window.scrollY > SCROLL_THRESHOLD) {
      scheduleHide();
    }
  });

  updateScrollState();
};
