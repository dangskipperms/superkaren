// The adult host's expressions: each one a mix of muscle units, after Ekman's FACS recipes.
// A narration hint like [warm] picks one. Talking blends the mouth shapes on top.

const EXPRESSIONS = {
  neutral: { label: "Neutral", mix: {} },
  warm: { label: "Warm", mix: { au6: 0.45, au12: 0.5, au1: 0.1, pitch: -0.1 } },
  delighted: { label: "Delighted", mix: { au6: 0.9, au12: 0.95, au26: 0.22, part: 0.5, au2: 0.2, pitch: -0.2 } },
  amused: { label: "Amused", mix: { au6L: 0.35, au6R: 0.2, au12L: 0.65, au12R: 0.3, au14L: 0.4, gx: -0.3, roll: -2 } },
  interested: { label: "Interested", mix: { au1: 0.3, au2: 0.35, au5: 0.25, au12: 0.15, pitch: 0.05, roll: 3 } },
  thinking: { label: "Thinking", mix: { au4: 0.35, au7: 0.3, au24: 0.35, au17: 0.3, gx: 0.6, gy: -0.6, yaw: 0.25, roll: 2 } },
  skeptical: { label: "Skeptical", mix: { au2L: 0.9, au4: 0.25, au7R: 0.45, au14R: 0.5, au12R: 0.15, au24: 0.25, yaw: -0.2, roll: -3 } },
  concerned: { label: "Concerned", mix: { au1: 0.55, au4: 0.4, au15: 0.25, au23: 0.2, pitch: 0.1 } },
  sad: { label: "Sad", mix: { au1: 0.85, au4: 0.35, au15: 0.65, au17: 0.45, gy: 0.5, pitch: 0.25, closeL: 0.2, closeR: 0.2 } },
  grieving: { label: "Grieving", mix: { au1: 1, au4: 0.6, au6: 0.3, au15: 0.9, au17: 0.7, au20: 0.3, gy: 0.7, pitch: 0.35, closeL: 0.35, closeR: 0.35 } },
  irritated: { label: "Irritated", mix: { au4: 0.6, au7: 0.45, au24: 0.5, au23: 0.3, gx: 0.2 } },
  angry: { label: "Angry", mix: { au4: 1, au5: 0.45, au7: 0.65, au23: 0.7, au10: 0.25, au9: 0.2, pitch: 0.12, pupil: 0.8 } },
  disgusted: { label: "Disgusted", mix: { au9: 0.9, au10: 0.7, au4: 0.5, au7: 0.4, au15: 0.3, au17: 0.4, yaw: 0.15, pitch: -0.1 } },
  contempt: { label: "Contempt", mix: { au12R: 0.45, au14R: 0.8, au2R: 0.2, closeL: 0.25, closeR: 0.25, pitch: -0.25, yaw: 0.15 } },
  surprised: { label: "Surprised", mix: { au1: 0.9, au2: 0.9, au5: 0.8, au26: 0.4, part: 0.7, pupil: 1.15, pitch: -0.1 } },
  afraid: { label: "Afraid", mix: { au1: 0.9, au2: 0.55, au4: 0.6, au5: 0.95, au20: 0.75, au26: 0.25, part: 0.6, pupil: 1.25 } },
  worried: { label: "Worried", mix: { au1: 0.75, au4: 0.5, au20: 0.35, au24: 0.3, gx: 0.4, gy: 0.2 } },
  determined: { label: "Determined", mix: { au4: 0.4, au7: 0.35, au24: 0.45, au17: 0.4, pitch: 0.18 } },
  proud: { label: "Proud", mix: { au12: 0.3, au24: 0.25, au17: 0.3, au6: 0.15, pitch: -0.35, closeL: 0.15, closeR: 0.15 } },
  embarrassed: { label: "Embarrassed", mix: { au12: 0.4, au24: 0.3, au1: 0.3, gx: 0.6, gy: 0.6, yaw: 0.3, pitch: 0.25, roll: 4 } },
  tender: { label: "Tender", mix: { au1: 0.4, au6: 0.25, au12: 0.3, closeL: 0.25, closeR: 0.25, roll: -4, pitch: 0.08 } },
  relieved: { label: "Relieved", mix: { au1: 0.3, au12: 0.35, au6: 0.2, closeL: 0.5, closeR: 0.5, pitch: -0.2 } },
};

// Rhubarb's nine mouth shapes as muscle values. X is rest: the expression's own mouth.
const MOUTH_SHAPES = {
  A: { label: "M B P", mix: { au24: 0.5, au23: 0.2 } },
  B: { label: "S T K EE", mix: { part: 0.7, au26: 0.06, au20: 0.25 } },
  C: { label: "EH AE", mix: { part: 0.9, au26: 0.32 } },
  D: { label: "AA", mix: { part: 1, au26: 0.65 } },
  E: { label: "AO ER", mix: { part: 0.8, au26: 0.38, au18: 0.4 } },
  F: { label: "OO W", mix: { part: 0.5, au26: 0.14, au18: 1 } },
  G: { label: "F V", mix: { part: 0.4, au26: 0.06, bite: 1 } },
  H: { label: "L", mix: { part: 0.8, au26: 0.34, tup: 1 } },
  X: { label: "rest", mix: {} },
};

// Shades a narration asks for by name, kept out of the slider film's list.
// A fake smile is lip corners without the cheeks (no AU6). A real one has both.
const SHADES = {
  furious: { label: "Furious", mix: { au4: 1, au5: 0.6, au7: 0.5, au9: 0.6, au10: 0.75, au20: 0.4, au26: 0.12, part: 0.6, au23: 0.3, pitch: 0.22, pupil: 0.7, roll: -2 } },
  fakeFaint: { label: "Faint fake smile", mix: { au12: 0.35, au24: 0.3, au20: 0.1 } },
  fakeBig: { label: "Big fake smile", mix: { au12: 1, au20: 0.55, part: 0.55, au26: 0.06, au5: 0.25, au2: 0.15 } },
  evil: { label: "Evil smile", mix: { au12L: 1, au12R: 0.6, au4: 0.9, au7: 0.5, au6: 0.25, au14L: 0.45, pitch: 0.35, gy: -0.5, roll: -3, pupil: 0.8 } },
  real: { label: "Real smile", mix: { au6: 0.85, au12: 0.9, part: 0.35, au26: 0.05, au1: 0.15, pitch: -0.12, roll: -2 } },
};
