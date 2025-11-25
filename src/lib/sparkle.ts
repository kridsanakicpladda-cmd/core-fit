export function createSparkle(x: number, y: number): HTMLElement {
  const sparkle = document.createElement("div");
  sparkle.className = "sparkle";
  
  const offsetX = (Math.random() - 0.5) * 40;
  const offsetY = (Math.random() - 0.5) * 40;
  
  sparkle.style.left = `${x + offsetX}px`;
  sparkle.style.top = `${y + offsetY}px`;
  
  // Random size for more variety
  const size = Math.random() * 6 + 4;
  sparkle.style.width = `${size}px`;
  sparkle.style.height = `${size}px`;
  
  document.body.appendChild(sparkle);
  
  setTimeout(() => {
    sparkle.remove();
  }, 1000);
  
  return sparkle;
}

export function addSparkleEffect(e: React.MouseEvent) {
  const x = e.clientX;
  const y = e.clientY;
  
  // Create multiple sparkles with stagger
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      createSparkle(x, y);
    }, i * 40);
  }
}
