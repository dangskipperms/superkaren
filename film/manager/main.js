// The music video's frame at T: scene in, every layer drawn. Pure in T.

const CELLS = Array.from({ length: 12 }, (_, i) => {
  const d = document.createElement("div");
  d.className = "cell";
  document.getElementById("stage").appendChild(d);
  return d;
});
const CROP = 'viewBox="100 60 800 800"';

function drawCells(T, sc) {
  CELLS.forEach((d, i) => {
    const c = sc.cells[i];
    if (!c) {
      d.style.display = "none";
      return;
    }
    const pop = c.pop === undefined ? 1 : Math.max(0, c.pop);
    d.style.display = "block";
    d.style.left = `${n2(c.x - c.size / 2)}px`;
    d.style.top = `${n2(c.y - c.size / 2)}px`;
    d.style.width = d.style.height = `${n2(c.size)}px`;
    d.style.zIndex = c.z ?? 2;
    d.style.background = c.tint ? c.tint.bg : "transparent";
    d.style.transform = `scale(${n2((c.flip ? -1 : 1) * pop)},${n2(pop)}) rotate(${n2(c.rot || 0)}deg)`;
    d.style.filter = c.tint ? `${c.tint.f} contrast(1.15)` : "none";
    const p = karen(T, { groove: sc.groove, mood: c.mood, k: c.k, seed: c.seed || 0, lips: c.lips });
    d.innerHTML = hostSVG(p, `c${i}`, { bg: false }).replace('viewBox="0 0 1000 1000"', CROP);
  });
}

function filmDraw(T) {
  const sc = sceneAt(T);
  document.getElementById("bg").innerHTML = bgSVG(sc.bg, T, sc.pal, { rays: sc.rays });
  const cam = sc.cam;
  const stage = document.getElementById("stage");
  stage.style.transformOrigin = `${cam.fx}px ${cam.fy}px`;
  stage.style.transform = `translate(${n2(cam.x)}px,${n2(cam.y)}px) rotate(${n2(cam.r)}deg) scale(${n2(cam.s)})`;
  drawCells(T, sc);
  document.getElementById("props").innerHTML = `<svg viewBox="0 0 1920 1080" width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">${sc.props}</svg>`;
  // outlined words sit behind her, the rest in front
  const back = sc.kin.match(/<div class="kin back"[^>]*>[^<]*<\/div>/g) || [];
  document.getElementById("kinback").innerHTML = back.join("");
  document.getElementById("kin").innerHTML = back.reduce((k, b) => k.replace(b, ""), sc.kin);
  lyricsDraw(T, sc.pal.c);
  fxDraw(T, sc.fx);
}
