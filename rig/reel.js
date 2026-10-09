// The 24s reel: eight emotions in a row.
go(0, 0, "sleepy");
nudge(0.55, 0.35, { closeL: 0.45, closeR: 0.5 }, "power2.out");
nudge(0.95, 0.12, { closeL: 1, closeR: 1 }, "power2.in");
go(1.2, 0.45, "neutral", "back.out(1.6)");
nudge(1.75, 0.18, { gx: -20, gy: 4, faceX: -10 });
nudge(2.3, 0.18, { gx: 18, gy: -2, faceX: 8 });
go(2.9, 0.6, "curious");
nudge(4.0, 0.25, { gx: 10, gy: -14 });
// anticipation before the laugh
nudge(4.75, 0.2, { squash: 0.05, hy: 10, mw: 40, mlo: 6, closeL: 0.3, closeR: 0.3 }, "power2.in");
go(4.95, 0.35, "joy", "back.out(1.4)");
nudge(6.9, 0.35, { laugh: 0.25, mlo: 60, closeL: 0.75, closeR: 0.75 });
// anticipation before the startle
nudge(7.55, 0.15, { squash: 0.06, hy: 14, closeL: 0.7, closeR: 0.7, mlo: 10, mw: 46, laugh: 0, bg1: hex("#ffe9e0"), bg2: hex("#ff9e8a") }, "power2.in");
go(7.7, 0.22, "surprise", "back.out(2.2)");
go(9.7, 0.55, "fear");
nudge(10.7, 0.12, { gx: -18, faceX: -30 });
nudge(11.2, 0.12, { gx: 24, faceX: -22 });
go(12.4, 0.5, "anger", "back.out(1.3)");
nudge(13.7, 0.12, { squash: 0.08, hy: 20 }, "power2.out");
nudge(13.85, 0.4, { squash: 0.04, hy: 12 }, "elastic.out(1,0.5)");
go(15.1, 1.1, "sad", "power2.inOut");
go(18.0, 0.45, "disgust", "back.out(1.5)");
nudge(19.2, 0.3, { gx: -10, gy: 10, faceX: -36, hr: -11 });
go(20.6, 0.4, "smug", "back.out(1.8)");
nudge(21.6, 0.5, { closeR: 0.15, lR: 50, lcR: 6, mcR: -26 }, "power2.out");
nudge(22.4, 0.2, { hy: 4, hr: 6 }, "power2.inOut");
nudge(22.6, 0.3, { hy: -6, hr: 10 }, "back.out(2)");

BLINKS.push(3.6, 9.25, 11.8, 14.6, 17.4, 19.9, 23.3);
const LABELS = [
  [0, 2.9, "00", "WAKE"],
  [2.9, 4.8, "01", "CURIOUS"],
  [4.8, 7.6, "02", "JOY"],
  [7.6, 9.7, "03", "SURPRISE"],
  [9.7, 12.4, "04", "FEAR"],
  [12.4, 15.1, "05", "ANGER"],
  [15.1, 18.0, "06", "SADNESS"],
  [18.0, 20.6, "07", "DISGUST"],
  [20.6, 24.5, "08", "SMUG"],
];

const labelHost = $("root");
LABELS.forEach(([, , n, w], i) => {
  const el = document.createElement("div");
  el.className = "emo";
  el.id = "emo" + i;
  el.innerHTML = `<span class="num">${n} / 08</span><span class="word">${w}</span>`;
  labelHost.appendChild(el);
});

// the reel: its own events and labels on top of the shared face
function draw(T) {
  const s = poseAt(T);
  const ink = renderFace(s, T, blinkAt(T));

  // sweat runs down the temple during fear
  const sw = clamp((T - 10.0) / 2.2);
  $("sweat").setAttribute("transform", `translate(${f(705 - sw * 6)},${f(300 + sw * 140)}) scale(${f(0.6 + clamp(sw * 4) * 0.4)})`);
  setOpacity("sweat", clamp(sw * 6) * clamp((12.4 - T) / 0.3));

  // a tear wells on the lower lid then falls
  const tw = clamp((T - 16.0) / 0.9), tf = clamp((T - 16.9) / 1.0);
  $("tear").setAttribute(
    "transform",
    `translate(${f(372 - tf * 14)},${f(462 + s.lL + 10 + tf * 120)}) scale(${f(0.3 + tw * 0.6)})`,
  );
  setOpacity("tear", clamp(tw * 3) * clamp((18.1 - T) / 0.3));

  LABELS.forEach(([a, b], i) => {
    const el = $("emo" + i);
    const o = clamp((T - a) / 0.25) * clamp((b - T) / 0.2);
    el.style.opacity = f(o);
    el.style.transform = `translateY(${f((1 - clamp((T - a) / 0.35)) * 24)}px)`;
    el.style.color = ink;
  });
}
