// Render Perimystic's two-line display mark for the existing canvas preloader
// and WebGL particle system. No old-studio branding is used.
export const PERIMYSTIC_LOGO_VIEWBOX = { w: 940, h: 500 };

type DrawOpts = { widthFrac?: number; cx?: number; cy?: number; color?: string };

export function drawPerimysticLogo(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  opts: DrawOpts = {}
) {
  const { widthFrac = 0.9, cx = 0.5, cy = 0.5, color = "#ffe05d" } = opts;
  const { w, h } = PERIMYSTIC_LOGO_VIEWBOX;
  const scale = Math.min((canvasW * widthFrac) / w, (canvasH * 0.75) / h);
  ctx.save();
  ctx.translate(canvasW * cx - (w * scale) / 2, canvasH * cy - (h * scale) / 2);
  ctx.scale(scale, scale);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = '900 260px Impact, "Arial Black", sans-serif';
  ctx.lineJoin = "round";
  ctx.fillStyle = color;
  ctx.fillText("PERI", w / 2, 145, w - 60);
  ctx.fillText("MYSTIC", w / 2, 365, w - 60);
  ctx.restore();
}
