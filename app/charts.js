// charts.js — the site's two canvas charts: a donut of spending by category
// and a grouped bar chart of income against spending by month. Both draw
// with the plain canvas API (no library, nothing fetched), sized to the
// device pixel ratio so they stay sharp on a phone.

function prepare(canvas, cssHeight) {
  const width = canvas.clientWidth;
  const height = cssHeight;
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  return { ctx, width, height };
}

const INK = '#22302a';
const FAINT = '#7a877f';

// donutChart(canvas, [{value, color}], centreTop, centreBottom)
// A ring whose slices are the values in order, starting at the top, with
// two lines of text in the hole (a total and its caption).
export function donutChart(canvas, slices, centreTop, centreBottom) {
  const { ctx, width, height } = prepare(canvas, 210);
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 6;
  const inner = radius * 0.62;
  let angle = -Math.PI / 2;
  for (const slice of slices) {
    if (!total) break;
    const sweep = (slice.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, angle, angle + sweep);
    ctx.arc(cx, cy, inner, angle + sweep, angle, true);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();
    angle += sweep;
  }
  if (!total) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.arc(cx, cy, inner, 0, Math.PI * 2, true);
    ctx.fillStyle = '#e4e7e2';
    ctx.fill();
  }
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.font = '700 19px system-ui, sans-serif';
  ctx.fillText(centreTop, cx, cy - 2);
  ctx.fillStyle = FAINT;
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText(centreBottom, cx, cy + 15);
}

// trendChart(canvas, [{label, income, expenses}])
// Two bars a month — green for money in, rust for money out — with the
// month's short label under each pair and a light gridline at the top value.
export function trendChart(canvas, months) {
  const { ctx, width, height } = prepare(canvas, 230);
  const top = Math.max(1, ...months.flatMap((m) => [m.income, m.expenses]));
  const padLeft = 8;
  const padBottom = 22;
  const plotH = height - padBottom - 14;
  const groupW = (width - padLeft * 2) / months.length;
  const barW = Math.min(34, groupW / 2 - 8);

  ctx.strokeStyle = '#dde3dc';
  ctx.beginPath();
  ctx.moveTo(padLeft, 14 + plotH);
  ctx.lineTo(width - padLeft, 14 + plotH);
  ctx.stroke();

  months.forEach((m, i) => {
    const gx = padLeft + i * groupW + groupW / 2;
    const draw = (value, dx, color) => {
      const h = (value / top) * plotH;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(gx + dx - barW / 2, 14 + plotH - h, barW, h, [4, 4, 0, 0]);
      ctx.fill();
    };
    draw(m.income, -barW / 2 - 2, '#2e9e5b');
    draw(m.expenses, barW / 2 + 2, '#d96f32');
    ctx.fillStyle = FAINT;
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(m.label, gx, height - 6);
  });
}
