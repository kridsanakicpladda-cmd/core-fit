export function createSparkle(x: number, y: number): HTMLElement {
  const sparkle = document.createElement("div");
  sparkle.className = "sparkle";
  
  const offsetX = (Math.random() - 0.5) * 30;
  const offsetY = (Math.random() - 0.5) * 30;
  
  sparkle.style.left = `${x + offsetX}px`;
  sparkle.style.top = `${y + offsetY}px`;
  
  document.body.appendChild(sparkle);
  
  setTimeout(() => {
    sparkle.remove();
  }, 1000);
  
  return sparkle;
}

export function addSparkleEffect(e: React.MouseEvent) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX;
  const y = e.clientY;
  
  // Create multiple sparkles
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      createSparkle(x, y);
    }, i * 50);
  }
}
