// carousel init for any [data-video-carousel] instances
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-video-carousel]").forEach((container) => {
    const videos = Array.from(container.querySelectorAll("video"));
    if (!videos.length) return;

    let idx = 0;
    const show = (i) => {
      videos.forEach((v, j) => {
        v.classList.toggle("opacity-100", j === i);
        v.classList.toggle("opacity-0", j !== i);
        v.classList.toggle("pointer-events-none", j !== i);
        if (j === i) {
          v.currentTime = 0;
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    };

    show(0);

    if (videos.length <= 1) return;

    const intervalMs = 8000;
    let timer = setInterval(() => {
      idx = (idx + 1) % videos.length;
      show(idx);
    }, intervalMs);

    const section = container.closest("section") || document;
    const prevBtn = section.querySelector("[data-prev]");
    const nextBtn = section.querySelector("[data-next]");

    [prevBtn, nextBtn].forEach((btn) => {
      if (!btn) return;
      btn.addEventListener("click", () => {
        clearInterval(timer);
        idx = btn.hasAttribute("data-prev")
          ? (idx - 1 + videos.length) % videos.length
          : (idx + 1) % videos.length;
        show(idx);
        timer = setInterval(() => {
          idx = (idx + 1) % videos.length;
          show(idx);
        }, intervalMs);
      });
    });
  });
});