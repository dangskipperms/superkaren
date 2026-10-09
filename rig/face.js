// One frame of the face from a state and a time. Returns the ink colour that reads on its background.
function renderFace(s, T, blink) {
  const TAU = Math.PI * 2;
  // life: breath, laughter, trembling, quivering
  const breath = Math.sin((TAU * T) / 3.1);
  const laughW = Math.sin(TAU * 6.2 * T);
  const shakeA = Math.sin(TAU * 17 * T) + 0.5 * Math.sin(TAU * 29 * T);
  s.jx = s.tremble * 1.6 * Math.sin(TAU * 23 * T);
  s.jy = s.tremble * 1.0 * Math.sin(TAU * 19 * T);
  s.mlo += s.laugh * 16 * laughW;
  s.mup -= s.laugh * 3 * laughW;
  const quiv = s.quiver * Math.sin(TAU * 9 * T);
  s.mcL += quiv * 2.5;
  s.mcR -= quiv * 2.5;
  s.mlo += quiv * 2;

  const hx = s.hx + s.tremble * 3.5 * shakeA;
  const hy = s.hy + breath * 4 + s.laugh * 7 * Math.abs(laughW) - s.laugh * 4;
  const sq = s.squash + s.laugh * 0.012 * laughW;
  const sy = 1 - sq, sx = 1 + sq * 0.7;

  // background
  const c1 = s.bg1.map(Math.round), c2 = s.bg2.map(Math.round);
  $("bg").style.background = `radial-gradient(circle at 62% 46%, rgb(${c1}) 0%, rgb(${c2}) 78%)`;
  const lum = (0.3 * c2[0] + 0.59 * c2[1] + 0.11 * c2[2]) / 255;
  const ink = lum < 0.42 ? "#f6efe4" : "#2b1e2f";
  if ($("caption")) $("caption").style.color = ink;

  $("body").setAttribute("transform", `translate(${f(hx * 0.3)},${f(-s.shrug + breath * 2)})`);
  $("head").setAttribute(
    "transform",
    `translate(${f(hx)},${f(hy)}) rotate(${f(s.hr)},500,780) translate(500,800) scale(${f(sx * s.zoom)},${f(sy * s.zoom)}) translate(-500,-800)`,
  );
  // a three-quarter turn: features slide one way, ears and hair the other
  $("face").setAttribute("transform", `translate(${f(s.faceX)},${f(s.faceY)})`);
  $("earL").setAttribute("transform", `translate(${f(-s.faceX * 0.35 + Math.max(0, s.faceX) * 0.4)},${f(s.faceY * 0.3)})`);
  $("earR").setAttribute("transform", `translate(${f(-s.faceX * 0.35 + Math.min(0, s.faceX) * 0.4)},${f(s.faceY * 0.3)})`);
  $("hair").setAttribute("transform", `translate(${f(s.faceX * 0.25)},${f(s.faceY * -0.2)})`);
  $("shade").setAttribute("cx", f(770 - s.faceX * 2.4));
  $("tuft").setAttribute("transform", `rotate(${f(s.tuft)},506,150)`);

  eye("L", s, blink);
  eye("R", s, blink);
  brow("L", s);
  brow("R", s);
  mouth(s, T);

  $("nostrilL").setAttribute("rx", f(7 * s.nostril));
  $("nostrilR").setAttribute("rx", f(7 * s.nostril));
  $("nose").setAttribute("transform", `translate(0,${f(s.noseUp)})`);
  setOpacity("wrinkle", s.wrinkle);
  setOpacity("blushL", s.blush * 0.75);
  setOpacity("blushR", s.blush * 0.75);
  $("blushL").setAttribute("cy", f(575 + Math.min(0, s.mcL) * 0.4));
  $("blushR").setAttribute("cy", f(575 + Math.min(0, s.mcR) * 0.4));
  setOpacity("pale", s.pale * 0.45);
  setOpacity("flush", s.flush);
  $("flush").setAttribute("y", f(lerp(700, 120, s.flush)));

  // anger mark throbs
  const am = s.anger;
  const throb = 1 + 0.12 * Math.max(0, Math.sin(TAU * 2.4 * T));
  $("angerMark").setAttribute("transform", `translate(690,250) scale(${f(am * throb)})`);
  setOpacity("angerMark", am);

  return ink;
}
