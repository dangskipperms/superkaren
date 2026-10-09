// Every mood the rig holds, one after another, each with its label.
const RANGE = [
  "cheerful", "joy", "excited", "proud", "warm", "smug", "curious", "thinking", "confused", "skeptical",
  "surprise", "worried", "fear", "embarrassed", "secretive", "bored", "sad", "determined", "anger", "disgust",
];
const STEP = 1.18;
const NAMES = { anger: "ANGER", sad: "SADNESS", joy: "JOY" };

go(0, 0, "neutral");
RANGE.forEach((m, i) => {
  go(0.3 + i * STEP, 0.32, m, "back.out(1.4)");
  BLINKS.push(0.3 + i * STEP + 0.75);
});

RANGE.forEach((m, i) => {
  const el = document.createElement("div");
  el.className = "emo";
  el.id = "emo" + i;
  el.innerHTML = `<span class="num">${String(i + 1).padStart(2, "0")} / 20</span><span class="word">${NAMES[m] || m.toUpperCase()}</span>`;
  $("root").appendChild(el);
});

function draw(T) {
  const ink = renderFace(poseAt(T), T, blinkAt(T));
  RANGE.forEach((m, i) => {
    const a = 0.3 + i * STEP, b = a + STEP;
    const el = $("emo" + i);
    el.style.opacity = f(clamp((T - a) / 0.15) * (i === RANGE.length - 1 ? 1 : clamp((b - T) / 0.12)));
    el.style.color = ink;
  });
}
