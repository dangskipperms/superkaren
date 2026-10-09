// The music video's words: the full lyrics as karaoke at the bottom, and kinetic words that slam in.

function lyricsDraw(T, accent) {
  const bar = document.getElementById("lyrics");
  const k = lineAt(T);
  const line = SONG.lines[k], next = SONG.lines[k + 1];
  const shown = line && T < Math.max(line.e + 0.8, next ? Math.min(next.s - 0.15, line.e + 2.5) : line.e + 2.5);
  if (!shown) {
    bar.style.opacity = 0;
    return;
  }
  const into = ease((T - line.s + 0.15) / 0.2);
  bar.style.opacity = into;
  bar.style.transform = `translate(-50%, ${n2(20 * (1 - into))}px)`;
  bar.innerHTML = line.words.map((w) => {
    const on = T >= w.s, now = on && T < w.e + 0.05;
    const pop = now ? 1 + 0.08 * (1 - ease((T - w.s) / 0.2)) : 1;
    return `<span style="color:${now ? accent : on ? "#fff" : "rgba(255,255,255,0.35)"};transform:scale(${n2(pop)})">${w.w}</span>`;
  }).join("");
  document.getElementById("section").textContent = line.section.toUpperCase();
}

// a word that lands on its time. style: slam, stamp, behind, type
function kinWord(T, s, d, text, style, o = {}) {
  const u = (T - s) / d;
  if (u < 0 || u > 1) return "";
  const out = 1 - ease((u - 0.8) / 0.2);
  const x = o.x ?? 960, y = o.y ?? 540, size = o.size ?? 200, color = o.color ?? "#fff";
  let tr = "", op = out, extra = "";
  if (style === "slam") {
    const a = easeOut((T - s) / 0.18);
    tr = `scale(${n2(2.4 - 1.4 * a)})`;
    op *= a;
  }
  if (style === "stamp") {
    const a = easeOut((T - s) / 0.12);
    tr = `rotate(${o.rot ?? -8}deg) scale(${n2(1.8 - 0.8 * a)})`;
    extra = `border:10px solid ${color};padding:0 30px;`;
    op *= a;
  }
  if (style === "behind") {
    tr = `scale(${n2(1 + 0.15 * u + 0.05 * pulse(T))})`;
    extra = `-webkit-text-stroke:4px ${color};color:transparent;`;
    op *= 0.8 * ease((T - s) / 0.15);
  }
  if (style === "type") text = text.slice(0, Math.ceil(text.length * Math.min(1, (T - s) / 0.5)));
  return `<div class="kin${style === "behind" ? " back" : ""}" style="left:${x}px;top:${y}px;font-size:${size}px;color:${color};opacity:${n2(op)};transform:translate(${o.align === "left" ? "0" : "-50%"},-50%) ${tr};transform-origin:${o.align === "left" ? "left" : "center"} center;${extra}">${text}</div>`;
}
