// The adult host's fixed parts: face outline, stubble, ears, nose, hair, neck and sweater.
// Paths are [start, [c1, c2, end], ...] so the jaw can stretch every point.

const FACE_PATH = [
  [500, 200],
  [[590, 200], [660, 250], [668, 340]],
  [[674, 410], [672, 470], [664, 530]],
  [[656, 590], [642, 640], [614, 678]],
  [[584, 716], [542, 738], [500, 740]],
  [[458, 738], [416, 716], [386, 678]],
  [[358, 640], [344, 590], [336, 530]],
  [[328, 470], [326, 410], [332, 340]],
  [[340, 250], [410, 200], [500, 200]],
];

const STUB_PATH = [
  [344, 540],
  [[356, 612], [388, 672], [432, 710]],
  [[466, 738], [534, 738], [568, 710]],
  [[612, 672], [644, 612], [656, 540]],
  [[640, 562], [614, 584], [584, 594]],
  [[562, 584], [530, 578], [500, 580]],
  [[470, 578], [438, 584], [416, 594]],
  [[386, 584], [360, 562], [344, 540]],
];

function hostEars(fx) {
  const ear = (s) => {
    const X = (x) => 500 + s * (x - 500);
    return `<path d="M${X(340)},448 C${X(312)},430 ${X(294)},458 ${X(298)},494 C${X(302)},532 ${X(316)},558 ${X(346)},562 Z" fill="${s < 0 ? "#e2ab8c" : "#c88a6d"}"/>
      <path d="M${X(330)},464 C${X(316)},466 ${X(312)},490 ${X(318)},512 C${X(322)},528 ${X(330)},540 ${X(340)},542" fill="none" stroke="${H.line}" stroke-width="2.2" opacity="0.45"/>`;
  };
  return `<g transform="translate(${n2(-fx * 0.35)},0)">${ear(-1)}${ear(1)}</g>`;
}

function hostNose(p, fx, fy, uid) {
  return `<g transform="translate(${n2(fx * 1.35)},${n2(fy - 4 * p.au9)}) translate(500,0) scale(1.15,1) translate(-500,8)">
    <ellipse cx="518" cy="495" rx="9" ry="48" fill="${H.shadow}" opacity="0.32" filter="url(#${uid}b6)"/>
    <ellipse cx="493" cy="500" rx="6" ry="34" fill="#fff3ea" opacity="0.16" filter="url(#${uid}b6)"/>
    <ellipse cx="500" cy="573" rx="24" ry="6" fill="${H.shadow}" opacity="0.5" filter="url(#${uid}b3)"/>
    <ellipse cx="496" cy="538" rx="9" ry="6" fill="#fff" opacity="0.14" filter="url(#${uid}b1)"/>
    <path d="M478,546 C463,548 461,564 476,568" fill="none" stroke="${H.line}" stroke-width="2.1" stroke-linecap="round" opacity="0.45"/>
    <path d="M522,546 C537,548 539,564 524,568" fill="none" stroke="${H.line}" stroke-width="2.1" stroke-linecap="round" opacity="0.45"/>
    <path d="M482,566 Q490,561 496,566 M504,566 Q510,561 518,566" fill="none" stroke="#5e3226" stroke-width="3" stroke-linecap="round" opacity="0.55"/>
    <g opacity="${n2(p.au9 * 0.8)}" stroke="${H.line}" stroke-width="1.4" fill="none"><path d="M488,486 l6,-4 M512,486 l-6,-4 M486,496 l8,-3 M514,496 l-8,-3"/></g>
  </g>
  <path d="M${pt(493 + fx * 1.2, 584 + fy)} L${pt(494 + fx * 1.15, 604 + fy)} M${pt(507 + fx * 1.2, 584 + fy)} L${pt(506 + fx * 1.15, 604 + fy)}" stroke="${H.shadow}" stroke-width="2" opacity="0.25" filter="url(#${uid}b1)"/>`;
}

const HAIR_PATH = "M352,500 C346,480 338,460 332,440 C322,400 316,340 318,300 C320,240 340,200 375,178 C420,145 470,136 515,138 C580,142 640,170 668,225 C684,260 684,340 678,380 C674,410 670,425 668,440 C662,460 658,480 652,500 L646,500 C650,460 652,410 646,370 C640,330 630,305 610,290 C590,276 560,262 500,258 C450,258 415,270 392,286 C368,302 356,335 352,375 C348,420 350,460 356,500 Z";
const HAIRLINE = "M356,500 C350,460 348,420 352,375 C356,335 368,302 392,286 C415,270 450,258 500,258 C560,262 590,276 610,290 C630,305 640,330 646,370 C652,410 650,460 646,500";

function hostHair(fx, uid) {
  return `<g transform="translate(${n2(fx * 0.25)},0)">
    <path d="${HAIRLINE}" fill="none" stroke="${H.hair}" stroke-width="7" opacity="0.5" filter="url(#${uid}b3)"/>
    <path d="${HAIR_PATH}" fill="url(#${uid}hair)"/>
    <clipPath id="${uid}hairclip"><path d="${HAIR_PATH}"/></clipPath>
    <g clip-path="url(#${uid}hairclip)" fill="#8a6a5a" filter="url(#${uid}b12)">
      <ellipse cx="335" cy="470" rx="22" ry="80" opacity="0.45"/>
      <ellipse cx="665" cy="470" rx="22" ry="80" opacity="0.3"/>
    </g>
    <g fill="none" stroke="${H.hairLit}" stroke-linecap="round" opacity="0.5">
      <path d="M440,250 C480,215 560,200 640,232" stroke-width="3"/>
      <path d="M446,214 C500,186 580,182 652,218" stroke-width="4"/>
      <path d="M452,178 C510,158 580,158 632,182" stroke-width="3"/>
      <path d="M410,256 C385,240 360,252 346,300" stroke-width="2.5"/>
      <path d="M416,220 C380,210 350,240 336,292" stroke-width="2.5"/>
      <path d="M600,282 C630,290 652,320 664,370" stroke-width="2"/>
    </g>
    <path d="M422,262 C424,230 430,200 446,150" fill="none" stroke="#120d0b" stroke-width="2.4" opacity="0.6"/>
  </g>`;
}

function hostBody(uid) {
  const neck = "M405,680 C408,745 400,795 386,836 L614,836 C600,795 592,745 595,680 Z";
  return `<path d="${neck}" fill="${H.skin}"/>
    <clipPath id="${uid}neck"><path d="${neck}"/></clipPath>
    <g clip-path="url(#${uid}neck)">
      <path d="M400,690 C450,770 550,770 600,690 L606,770 C560,810 440,810 394,770 Z" fill="${H.shadow}" opacity="0.65" filter="url(#${uid}b12)"/>
      <ellipse cx="590" cy="780" rx="30" ry="80" fill="${H.shadow}" opacity="0.4" filter="url(#${uid}b12)"/>
    </g>
    <path d="M40,1000 C60,900 170,852 300,828 C350,818 385,808 404,800 C430,842 470,856 500,856 C530,856 570,842 596,800 C615,808 650,818 700,828 C830,852 940,900 960,1000 Z" fill="url(#${uid}knit)"/>
    <path d="M404,800 C430,842 470,856 500,856 C530,856 570,842 596,800" fill="none" stroke="${H.knitRib}" stroke-width="18"/>
    <path d="M410,812 C436,848 472,862 500,862 C528,862 564,848 590,812" fill="none" stroke="${H.knitLit}" stroke-width="1.5" opacity="0.6"/>`;
}
