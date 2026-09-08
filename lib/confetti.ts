/**
 * Lightweight, zero-dependency celebration particle explosion
 * @param origin - { x, y } click coordinates in viewport pixels
 */
export function firePaidCelebration(origin?: { x: number; y: number }) {
  if (typeof window === "undefined") return;

  const count = 36;
  const colors = ["#10B981", "#059669", "#34D399", "#6EE7B7", "#F59E0B", "#3B82F6", "#6366F1"];
  const startX = origin?.x ?? window.innerWidth / 2;
  const startY = origin?.y ?? window.innerHeight / 2;

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "0";
  container.style.top = "0";
  container.style.width = "100vw";
  container.style.height = "100vh";
  container.style.pointerEvents = "none";
  container.style.zIndex = "99999";
  document.body.appendChild(container);

  const particles: HTMLElement[] = [];

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    const size = Math.random() * 8 + 4;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const isCircle = Math.random() > 0.5;

    el.style.position = "absolute";
    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;
    el.style.width = `${size}px`;
    el.style.height = `${isCircle ? size : size * 0.6}px`;
    el.style.backgroundColor = color;
    el.style.borderRadius = isCircle ? "50%" : "2px";
    el.style.willChange = "transform, opacity";
    el.style.opacity = "1";

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 160 + 80;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity - 60;
    const rotSpeed = (Math.random() - 0.5) * 720;

    container.appendChild(el);

    const startTime = performance.now();
    const duration = 900 + Math.random() * 300;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easeProgress = 1 - Math.pow(1 - progress, 2);

      const currentX = vx * (elapsed / 1000) * 1.5;
      const currentY = vy * (elapsed / 1000) * 1.5 + 400 * Math.pow(elapsed / 1000, 2);
      const currentRot = rotSpeed * progress;
      const opacity = Math.max(0, 1 - Math.pow(progress, 1.5));

      el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotate(${currentRot}deg)`;
      el.style.opacity = String(opacity);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    particles.push(el);
  }

  setTimeout(() => {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }, 1400);
}
