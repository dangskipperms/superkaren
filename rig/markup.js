// The face, drawn once. Every page that shows him mounts it into <svg id="rig">.
$("rig").innerHTML = `
  <defs>
    <clipPath id="headClip"><path id="headClipPath" /></clipPath>
    <clipPath id="eyeClipL"><ellipse cx="0" cy="0" rx="61" ry="71" /></clipPath>
    <clipPath id="apertureL"><path id="apPathL" /></clipPath>
    <clipPath id="eyeClipR"><ellipse cx="0" cy="0" rx="61" ry="71" /></clipPath>
    <clipPath id="apertureR"><path id="apPathR" /></clipPath>
    <clipPath id="mouthClip"><path id="mouthClipPath" /></clipPath>
    <linearGradient id="flushGrad" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#e8323a" stop-opacity="0.85" />
      <stop offset="1" stop-color="#e8323a" stop-opacity="0" />
    </linearGradient>
    <radialGradient id="shadeGrad">
      <stop offset="0.35" stop-color="#e2a07c" stop-opacity="0.75" />
      <stop offset="1" stop-color="#e2a07c" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="chinGrad">
      <stop offset="0" stop-color="#d48c66" stop-opacity="0.4" />
      <stop offset="1" stop-color="#d48c66" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="tearGrad" cx="0.35" cy="0.35" r="0.7">
      <stop offset="0" stop-color="#ffffff" />
      <stop offset="1" stop-color="#7cc7ff" />
    </radialGradient>
  </defs>
  
  <!-- body -->
  <g id="body">
    <rect x="440" y="700" width="120" height="200" rx="40" fill="#d99a76" />
    <path d="M250,1060 C250,930 350,870 440,860 L560,860 C650,870 750,930 750,1060 Z" fill="#ff6b4a" />
    <path d="M440,860 C460,900 540,900 560,860" fill="none" stroke="#c94a2e" stroke-width="10" stroke-linecap="round" />
  </g>
  
  <!-- head -->
  <g id="head">
    <g id="ears">
      <g id="earL">
        <ellipse cx="243" cy="500" rx="40" ry="60" fill="#f2c3a0" />
        <path d="M250,470 C228,480 228,525 250,535" fill="none" stroke="#d99a76" stroke-width="9" stroke-linecap="round" />
      </g>
      <g id="earR">
        <ellipse cx="757" cy="500" rx="40" ry="60" fill="#f2c3a0" />
        <path d="M750,470 C772,480 772,525 750,535" fill="none" stroke="#d99a76" stroke-width="9" stroke-linecap="round" />
      </g>
    </g>
    <path id="headShape" fill="#f2c3a0" />
  
    <g id="face">
      <ellipse id="blushL" cx="335" cy="575" rx="48" ry="27" fill="#ff7e79" opacity="0.2" />
      <ellipse id="blushR" cx="665" cy="575" rx="48" ry="27" fill="#ff7e79" opacity="0.2" />
  
      <!-- eyes -->
      <g id="eyeL" transform="translate(400,462)">
        <g clip-path="url(#eyeClipL)">
          <g clip-path="url(#apertureL)">
          <ellipse cx="0" cy="0" rx="58" ry="68" fill="#ffffff" />
          <g id="irisL">
            <circle r="33" fill="#2fa39a" />
            <circle r="33" fill="none" stroke="#1d6f69" stroke-width="5" />
            <circle id="pupilL" r="16" fill="#1a1420" />
            <circle id="hlL1" cx="-11" cy="-12" r="9" fill="#ffffff" />
            <circle id="hlL2" cx="11" cy="10" r="4" fill="#ffffff" opacity="0.85" />
          </g>
          <ellipse cx="0" cy="0" rx="58" ry="68" fill="none" stroke="#2b1e2f" stroke-width="5" />
          </g>
          <path id="lidLowLineL" fill="none" stroke="#c98a6b" stroke-width="5" stroke-linecap="round" />
          <path id="lashL" fill="none" stroke="#2b1e2f" stroke-width="9" stroke-linecap="round" />
        </g>
      </g>
      <g id="eyeR" transform="translate(600,462)">
        <g clip-path="url(#eyeClipR)">
          <g clip-path="url(#apertureR)">
          <ellipse cx="0" cy="0" rx="58" ry="68" fill="#ffffff" />
          <g id="irisR">
            <circle r="33" fill="#2fa39a" />
            <circle r="33" fill="none" stroke="#1d6f69" stroke-width="5" />
            <circle id="pupilR" r="16" fill="#1a1420" />
            <circle id="hlR1" cx="-11" cy="-12" r="9" fill="#ffffff" />
            <circle id="hlR2" cx="11" cy="10" r="4" fill="#ffffff" opacity="0.85" />
          </g>
          <ellipse cx="0" cy="0" rx="58" ry="68" fill="none" stroke="#2b1e2f" stroke-width="5" />
          </g>
          <path id="lidLowLineR" fill="none" stroke="#c98a6b" stroke-width="5" stroke-linecap="round" />
          <path id="lashR" fill="none" stroke="#2b1e2f" stroke-width="9" stroke-linecap="round" />
        </g>
      </g>
  
      <!-- brows -->
      <path id="browL" fill="none" stroke="#3b2a4a" stroke-width="22" stroke-linecap="round" />
      <path id="browR" fill="none" stroke="#3b2a4a" stroke-width="22" stroke-linecap="round" />
  
      <!-- nose -->
      <g id="nose">
        <path id="wrinkle" d="M474,512 Q486,504 498,512 M502,512 Q514,504 526,512 M478,528 Q490,520 500,527" fill="none" stroke="#c98a6b" stroke-width="5" stroke-linecap="round" opacity="0" />
        <path d="M468,578 C468,552 484,530 500,530 C516,530 532,552 532,578 C532,600 468,600 468,578 Z" fill="#e3a985" />
        <ellipse cx="490" cy="550" rx="7" ry="10" fill="#ffffff" opacity="0.45" />
        <ellipse id="nostrilL" cx="487" cy="587" rx="7" ry="5" fill="#9c5c45" />
        <ellipse id="nostrilR" cx="513" cy="587" rx="7" ry="5" fill="#9c5c45" />
      </g>
  
      <!-- mouth -->
      <g id="mouth">
        <path id="mouthCavity" fill="#5a1f2e" />
        <g clip-path="url(#mouthClip)">
          <ellipse id="tongue" fill="#ff6f86" />
          <path id="teethU" fill="#ffffff" />
          <path id="teethL" fill="#ffffff" />
        </g>
        <path id="mouthLine" fill="none" stroke="#2b1e2f" stroke-width="8" stroke-linejoin="round" stroke-linecap="round" />
        <path id="lipShade" fill="none" stroke="#d99a76" stroke-width="7" stroke-linecap="round" />
        <path id="teethBite" fill="#ffffff" stroke="#2b1e2f" stroke-width="3" opacity="0" />
      <path id="smileL" fill="none" stroke="#c98a6b" stroke-width="5" stroke-linecap="round" />
        <path id="smileR" fill="none" stroke="#c98a6b" stroke-width="5" stroke-linecap="round" />
      </g>
  
      <!-- tear -->
      <path id="tear" d="M0,-26 C10,-10 16,0 16,8 C16,18 8,24 0,24 C-8,24 -16,18 -16,8 C-16,0 -10,-10 0,-26 Z" fill="url(#tearGrad)" stroke="#4aa3e0" stroke-width="3" opacity="0" />
    </g>
  
    <g id="tints" clip-path="url(#headClip)" style="mix-blend-mode: multiply">
      <ellipse id="shade" cx="770" cy="560" rx="230" ry="420" fill="url(#shadeGrad)" />
      <ellipse cx="500" cy="830" rx="200" ry="90" fill="url(#chinGrad)" />
      <rect id="pale" x="0" y="0" width="1000" height="1000" fill="#b9c8f0" opacity="0" />
      <rect id="flush" x="0" y="0" width="1000" height="700" fill="url(#flushGrad)" opacity="0" />
    </g>
  
    <!-- hair -->
    <g id="hair">
      <path d="M226,476 C196,300 300,136 500,136 C700,136 806,300 774,476 C764,404 748,354 724,324 C694,300 654,288 614,284 C584,304 544,304 506,276 C470,302 422,304 390,288 C340,300 302,322 282,352 C258,386 240,426 226,476 Z" fill="#3b2a4a" />
      <path d="M330,210 C380,170 440,158 500,160" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round" opacity="0.18" />
      <!-- the tuft swings from its root by design: follow-through, not a spin --><path id="tuft" data-layout-allow-orbit d="M486,150 C470,92 520,52 572,66 C536,80 516,108 526,150 Z" fill="#3b2a4a" />
    </g>
  
    <!-- extras -->
    <path id="sweat" d="M0,-30 C12,-12 18,0 18,10 C18,22 9,28 0,28 C-9,28 -18,22 -18,10 C-18,0 -12,-12 0,-30 Z" fill="#bfe6ff" stroke="#4aa3e0" stroke-width="3" opacity="0" />
    <g id="angerMark" opacity="0">
      <path d="M-34,-10 Q-12,-12 -10,-34 M10,-34 Q12,-12 34,-10 M34,10 Q12,12 10,34 M-10,34 Q-12,12 -34,10" fill="none" stroke="#e8323a" stroke-width="10" stroke-linecap="round" />
    </g>
  </g>
`;
$("headShape").setAttribute("d", HEAD_D);
$("headClipPath").setAttribute("d", HEAD_D);
