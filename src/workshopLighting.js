const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// A shallow 2D stage: distance/cone falloff and a small shadow away from the source.
export function getLightResponse(light, rect, depth = 24) {
  const radians = light.angle * Math.PI / 180;
  const longSurface = rect.width > 400 || rect.height > 400;
  const above = rect.top + rect.height / 2 < light.y;
  const x = longSurface ? clamp(light.x - Math.sin(radians) * 180, rect.left, rect.left + rect.width) : above ? rect.left + rect.width / 2 : clamp(light.x, rect.left, rect.left + rect.width);
  const y = longSurface ? clamp(light.y + Math.cos(radians) * 180, rect.top, rect.top + rect.height) : above ? rect.top + rect.height / 2 : clamp(light.y, rect.top, rect.top + rect.height);
  const dx = x - light.x;
  const dy = y - light.y;
  const distance = Math.hypot(dx, dy);
  const alignment = distance ? (dx * -Math.sin(radians) + dy * Math.cos(radians)) / distance : 1;
  const cone = Math.pow(clamp((alignment + .15) / 1.15, 0, 1), 2);
  // Continuous inverse-square falloff. The small indirect term is wall bounce,
  // so surfaces outside the shade's direct cone are never abruptly clipped.
  const falloff = 1 / (1 + (distance / 300) ** 2);
  const intensity = falloff * (.08 + .92 * cone);
  const centerX = longSurface ? dx : rect.left + rect.width / 2 - light.x;
  const centerY = longSurface ? dy : rect.top + rect.height / 2 - light.y;
  const length = Math.hypot(centerX, centerY) || 1;
  return { intensity, shadowX: centerX / length * depth, shadowY: centerY / length * depth, shadowOpacity: Math.min(.82, intensity * .95) };
}
