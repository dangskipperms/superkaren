// The slider stage every film of hers shares: her face, a name, a count, one slider per muscle.
// The drawing page keeps its own copy of the muscles.

const FILM_MUSCLES = [
  ["au1", "Inner brows up"], ["au2", "Outer brows up"], ["au4", "Brows down, together"],
  ["au5", "Eyes wide"], ["au6", "Cheeks up"], ["au7", "Lids tight"], ["au9", "Nose wrinkle"],
  ["au10", "Upper lip up"], ["au12", "Smile corners"], ["au14", "Dimple"], ["au15", "Corners down"],
  ["au17", "Chin up"], ["au18", "Pucker"], ["au20", "Lips stretch"], ["au23", "Lips tight"],
  ["au24", "Lips press"], ["au26", "Jaw open"], ["part", "Lips apart"],
  ["gx", "Look left / right", -1, 1], ["gy", "Look up / down", -1, 1],
  ["yaw", "Head turn", -1, 1], ["pitch", "Head tilt up / down", -1, 1], ["roll", "Head lean", -8, 8],
];

const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

function filmSliders(host) {
  host.innerHTML = FILM_MUSCLES.map(([k, label, lo = 0]) =>
    `<div class="row" data-k="${k}"><span>${label}</span><div class="track">${lo < 0 ? '<i class="mid"></i>' : ""}<b class="fill"></b><em class="thumb"></em></div></div>`).join("");
}

function stageDraw(T, p, label, glow, count) {
  document.getElementById("face").innerHTML = hostSVG(hostLife(T, p), "k").replace('viewBox="0 0 1000 1000"', 'viewBox="130 90 740 740"');
  const name = document.getElementById("name");
  name.textContent = label;
  name.style.opacity = 0.35 + 0.65 * glow;
  document.getElementById("count").textContent = count;

  document.querySelectorAll("#sliders .row").forEach((row) => {
    const [k, , lo = 0, hi = 1] = FILM_MUSCLES.find((m) => m[0] === row.dataset.k);
    const v = SIDED.includes(k) ? (p[k + "L"] + p[k + "R"]) / 2 : p[k];
    const at = (v - lo) / (hi - lo), zero = (0 - lo) / (hi - lo);
    const fill = row.querySelector(".fill");
    fill.style.left = `${Math.min(at, zero) * 100}%`;
    fill.style.width = `${Math.abs(at - zero) * 100}%`;
    row.querySelector(".thumb").style.left = `${at * 100}%`;
    row.classList.toggle("on", Math.abs(at - zero) > 0.02);
  });
}
