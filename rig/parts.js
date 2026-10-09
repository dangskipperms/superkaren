function eye(side, s, blink) {
  const inner = side === "L" ? 1 : -1;
  const close = Math.max(s["close" + side], blink);
  const lY = s["l" + side], lc = s["lc" + side], lt = s["lt" + side];
  const uY0 = s["u" + side] + s.gy * 0.35;
  const uY = lerp(uY0, lY, close);
  const uc = lerp(s["uc" + side], -lc, close);
  const ut = lerp(s["ut" + side], lt, close);
  const W = 80;
  // corner heights: positive tilt drops the inner corner
  const uCorner = uY - uc;
  const uInnerY = uCorner + ut, uOuterY = uCorner - ut;
  const uLeft = inner > 0 ? uOuterY : uInnerY, uRight = inner > 0 ? uInnerY : uOuterY;
  const lCorner = lY + lc;
  const lInnerY = lCorner + lt, lOuterY = lCorner - lt;
  const lLeft = inner > 0 ? lOuterY : lInnerY, lRight = inner > 0 ? lInnerY : lOuterY;
  const lCtl = 2 * lY - (lLeft + lRight) / 2;
  // the upper lid never crosses the lower one
  const uL = Math.min(uLeft, lLeft), uR = Math.min(uRight, lRight);
  const uCtl = Math.min(2 * Math.min(uY, lY) - (uL + uR) / 2, lCtl);
  $("apPath" + side).setAttribute(
    "d",
    `M${-W},${f(uL)} Q0,${f(uCtl)} ${W},${f(uR)} L${W},${f(lRight)} Q0,${f(lCtl)} ${-W},${f(lLeft)} Z`,
  );
  $("lash" + side).setAttribute("d", `M${-W},${f(uL)} Q0,${f(uCtl)} ${W},${f(uR)}`);
  $("lidLowLine" + side).setAttribute("d", `M${-W},${f(lLeft)} Q0,${f(lCtl)} ${W},${f(lRight)}`);
  const gx = s.gx + s.jx, gy = s.gy + s.jy;
  $("iris" + side).setAttribute("transform", `translate(${f(gx)},${f(gy)})`);
  $("pupil" + side).setAttribute("r", f(16 * s.pupil));
  // highlights hold the light source: they barely follow the gaze
  $("hl" + side + "1").setAttribute("transform", `translate(${f(-gx * 0.35)},${f(-gy * 0.35)})`);
  $("hl" + side + "2").setAttribute("transform", `translate(${f(-gx * 0.35)},${f(-gy * 0.35)})`);
}

function brow(side, s) {
  const sgn = side === "L" ? 1 : -1; // L inner points right
  const inX = 500 - sgn * (52 - s.bSq), outX = 500 - sgn * 166;
  const inY = 372 + s["b" + side + "in"], outY = 376 + s["b" + side + "out"];
  const arch = s["b" + side + "arch"];
  $("brow" + side).setAttribute(
    "d",
    `M${f(inX)},${f(inY)} Q${f((inX + outX) / 2)},${f((inY + outY) / 2 - arch * 2)} ${f(outX)},${f(outY)}`,
  );
}

function mouth(s, T) {
  const cx = 500, cy = 668;
  const w = s.mw;
  const cL = s.mcL, cR = s.mcR, up = s.mup;
  const lo = Math.max(up, s.mlo);
  const uL = up + s.mupL, uR = up + s.mupR;
  const P = (x, y) => `${f(cx + x)},${f(cy + y)}`;
  const upperHalf = (dy) =>
    `M${P(-w, cL + dy)} C${P(-w * 0.62, lerp(cL, uL, 0.8) + dy)} ${P(-w * 0.26, uL + dy)} ${P(0, up + dy)} ` +
    `C${P(w * 0.26, uR + dy)} ${P(w * 0.62, lerp(cR, uR, 0.8) + dy)} ${P(w, cR + dy)}`;
  const lowerBack = (dy) =>
    `C${P(w * 0.62, lerp(cR, lo, 0.9) + dy)} ${P(w * 0.32, lo + dy)} ${P(0, lo + dy)} ` +
    `C${P(-w * 0.32, lo + dy)} ${P(-w * 0.62, lerp(cL, lo, 0.9) + dy)} ${P(-w, cL + dy)}`;
  const shape = upperHalf(0) + " " + lowerBack(0) + " Z";
  $("mouthCavity").setAttribute("d", shape);
  $("mouthClipPath").setAttribute("d", shape);
  $("mouthLine").setAttribute("d", shape);
  // teeth follow the lip that holds them
  const tu = s.teethU, tl = s.teethL;
  $("teethU").setAttribute(
    "d",
    `M${P(-w, cL - 40)} L${P(w, cR - 40)} L${P(w, cR)} ` +
      `C${P(w * 0.62, lerp(cR, uR, 0.8) + tu)} ${P(w * 0.26, uR + tu)} ${P(0, up + tu)} ` +
      `C${P(-w * 0.26, uL + tu)} ${P(-w * 0.62, lerp(cL, uL, 0.8) + tu)} ${P(-w, cL)} Z`,
  );
  $("teethL").setAttribute(
    "d",
    `M${P(-w, cL + 40 + lo)} L${P(w, cR + 40 + lo)} L${P(w, cR)} ` +
      `C${P(w * 0.62, lerp(cR, lo, 0.9) - tl)} ${P(w * 0.32, lo - tl)} ${P(0, lo - tl)} ` +
      `C${P(-w * 0.32, lo - tl)} ${P(-w * 0.62, lerp(cL, lo, 0.9) - tl)} ${P(-w, cL)} Z`,
  );
  // the tongue rests on the floor of the mouth, or lifts behind the teeth for an L
  const tg = $("tongue");
  tg.setAttribute("cx", f(cx));
  tg.setAttribute("cy", f(cy + lerp(lo - 6 + (1 - s.tongue) * 30, up + tu + 7, s.tup)));
  tg.setAttribute("rx", f(w * lerp(0.55, 0.4, s.tup)));
  tg.setAttribute("ry", f(lerp(28, 13, s.tup)));
  // F and V: the upper teeth rest on the lower lip
  const bt = 9 * s.bite;
  $("teethBite").setAttribute(
    "d",
    `M${P(-w * 0.55, lerp(cL, uL, 0.8) - 1)} C${P(-w * 0.26, uL - 1)} ${P(w * 0.26, uR - 1)} ${P(w * 0.55, lerp(cR, uR, 0.8) - 1)} ` +
      `L${P(w * 0.5, lerp(cR, uR, 0.8) + bt)} C${P(w * 0.2, up + bt + 2)} ${P(-w * 0.2, up + bt + 2)} ${P(-w * 0.5, lerp(cL, uL, 0.8) + bt)} Z`,
  );
  setOpacity("teethBite", clamp(s.bite * 1.5));
  // a pucker thickens the lips into a ring
  $("mouthLine").setAttribute("stroke-width", f(8 + 6 * s.pk));
  // lower lip fullness and the smile creases
  const ll = lo + 16 + 6 * s.pk;
  $("lipShade").setAttribute("d", `M${P(-w * 0.35, ll - 2)} Q${P(0, ll + 8)} ${P(w * 0.35, ll - 2)}`);
  $("lipShade").setAttribute("opacity", f(clamp(clamp(1 - lo / 40) * 0.8 + s.pk * 0.6 + s.bite * 0.6)));
  const smile = clamp(-(cL + cR) / 2 / 24);
  $("smileL").setAttribute("d", `M${P(-w - 4, cL - 18)} Q${P(-w - 20, cL)} ${P(-w - 6, cL + 18)}`);
  $("smileR").setAttribute("d", `M${P(w + 4, cR - 18)} Q${P(w + 20, cR)} ${P(w + 6, cR + 18)}`);
  $("smileL").setAttribute("opacity", f(clamp(-cL / 24)));
  $("smileR").setAttribute("opacity", f(clamp(-cR / 24)));
  return smile;
}

function setOpacity(id, v) {
  $(id).setAttribute("opacity", f(clamp(v)));
}

