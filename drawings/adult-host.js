// The drawing page: a live host who idles, blends into any expression, and takes sliders.

const MUSCLES = [
  ["au1", "Inner brows up"], ["au2", "Outer brows up"], ["au4", "Brows down, together"],
  ["au5", "Eyes wide"], ["au6", "Cheeks up"], ["au7", "Lids tight"], ["au9", "Nose wrinkle"],
  ["au10", "Upper lip up"], ["au12", "Smile corners"], ["au14", "Dimple"], ["au15", "Corners down"],
  ["au17", "Chin up"], ["au18", "Pucker"], ["au20", "Lips stretch"], ["au23", "Lips tight"],
  ["au24", "Lips press"], ["au26", "Jaw open"], ["part", "Lips apart"],
  ["gx", "Look left / right", -1, 1], ["gy", "Look up / down", -1, 1],
  ["yaw", "Head turn", -1, 1], ["pitch", "Head tilt up / down", -1, 1], ["roll", "Head lean", -8, 8],
];

const hero = document.getElementById("hero");
let target = hostParams({}), shown = hostParams({});

// Idle life: blinks, breath, drifting gaze and head. Seeded by time, never a loop.
const idle = { nextBlink: 1.5, blinkAt: -1, nextGlance: 2, gx: 0, gy: 0 };
function life(t, p) {
  if (t > idle.nextBlink) (idle.blinkAt = t), (idle.nextBlink = t + 2 + Math.random() * 4);
  const b = idle.blinkAt < 0 ? 0 : (t - idle.blinkAt) / 0.16;
  const blink = b >= 0 && b < 1 ? Math.sin(b * Math.PI) : 0;
  if (t > idle.nextGlance) {
    idle.nextGlance = t + 1.2 + Math.random() * 3;
    idle.gx = (Math.random() - 0.5) * 0.35;
    idle.gy = (Math.random() - 0.5) * 0.2;
  }
  const q = { ...p };
  q.closeL = Math.max(q.closeL, blink);
  q.closeR = Math.max(q.closeR, blink);
  q.breath = Math.sin(t * 1.6);
  q.gx += idle.gx;
  q.gy += idle.gy;
  q.hx += Math.sin(t * 0.37) * 3 + Math.sin(t * 0.91) * 1.5;
  q.hy += Math.sin(t * 0.29 + 1) * 2 + q.breath * 1.5;
  q.roll += Math.sin(t * 0.23) * 0.8;
  return q;
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const k = 1 - Math.exp(-dt * 7);
  for (const key of Object.keys(shown)) shown[key] += (target[key] - shown[key]) * k;
  hero.innerHTML = hostSVG(life(now / 1000, shown), "hero").replace("viewBox=\"0 0 1000 1000\"", "viewBox=\"130 90 740 740\"");
  requestAnimationFrame(frame);
}

function setTarget(mix, name) {
  target = hostParams(mix);
  document.getElementById("now").textContent = name;
  syncSliders();
}

// sliders read and write the target, both sides at once
const sliders = document.getElementById("sliders");
for (const [key, label, lo = 0, hi = 1] of MUSCLES) {
  const row = document.createElement("label");
  row.className = "slider";
  row.innerHTML = `<span>${label}</span><input type="range" min="${lo}" max="${hi}" step="0.01" data-k="${key}">`;
  row.querySelector("input").addEventListener("input", (e) => {
    const v = +e.target.value;
    if (SIDED.includes(key)) target[key + "L"] = target[key + "R"] = v;
    else target[key] = v;
    document.getElementById("now").textContent = "Your mix";
    document.querySelectorAll(".tile.on").forEach((x) => x.classList.remove("on"));
  });
  sliders.appendChild(row);
}
function syncSliders() {
  sliders.querySelectorAll("input").forEach((i) => {
    const k = i.dataset.k;
    i.value = SIDED.includes(k) ? (target[k + "L"] + target[k + "R"]) / 2 : target[k];
  });
}
document.getElementById("reset").onclick = () => {
  document.querySelectorAll(".tile.on").forEach((x) => x.classList.remove("on"));
  setTarget({}, "Neutral");
};

function tiles(host, set, viewBox, sub) {
  Object.entries(set).forEach(([key, e], i) => {
    const d = document.createElement("div");
    d.className = "tile";
    d.innerHTML = hostSVG(hostParams(e.mix), host.id + i) + `<span>${sub ? `<b>${key}</b> <i>${e.label}</i>` : e.label}</span>`;
    d.querySelector("svg").setAttribute("viewBox", viewBox);
    d.onclick = () => {
      document.querySelectorAll(".tile.on").forEach((x) => x.classList.remove("on"));
      d.classList.add("on");
      setTarget(e.mix, sub ? `Mouth ${key} (${e.label})` : e.label);
    };
    host.appendChild(d);
  });
}
tiles(document.getElementById("expressions"), EXPRESSIONS, "270 220 460 460");
tiles(document.getElementById("mouths"), MOUTH_SHAPES, "400 530 200 200", true);
syncSliders();
requestAnimationFrame(frame);
