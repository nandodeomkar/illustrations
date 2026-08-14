import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {loadFont} from '@remotion/google-fonts/ArchitectsDaughter';

const {fontFamily} = loadFont();
const FONT = `${fontFamily}, 'Segoe Print', cursive`;

const WHITE = '#F2F6FA';
const RED = '#E5484D';
const AMBER = '#FFB224';

export const AmoebaBlueprint: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // --- timing helpers ---------------------------------------------------
  // draw-on / fade: linear ramp 0..1, clamped both ends
  const ramp = (start: number, dur: number) =>
    interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

  // pop: spring with slight overshoot around the group's local origin
  const pop = (start: number) =>
    spring({
      frame: frame - start,
      fps,
      config: {damping: 11, mass: 0.7, stiffness: 130},
    });

  // --- "alive" loop (only after the reveal settles) ---------------------
  const aliveRamp = ramp(150, 60);
  const breathe = 1 + 0.006 * aliveRamp * Math.sin((frame / 90) * 2 * Math.PI);
  const aliveT = `translate(960 540) scale(${breathe}) translate(-960 -540)`;

  // contractile vacuole "bails water": pulse on top of its pop
  const cvPulse = 1 + 0.13 * aliveRamp * Math.sin((frame / 22) * 2 * Math.PI);

  // amber cytoplasm streaming: dashes march toward the pseudopod tip
  const streamOffset = frame > 100 ? -((frame - 100) * 0.7) : 0;

  // --- per-group progress ----------------------------------------------
  const membraneDraw = ramp(0, 50);
  const contourFade = ramp(38, 26);
  const nucleusPop = pop(56);
  const foodPop = pop(70);
  const cvPop = pop(84);
  const flowFade = ramp(100, 16);

  const dimExt = ramp(116, 14);
  const dimBase = ramp(120, 30);
  const dimArrows = ramp(146, 12);
  const dimLabel = ramp(150, 16);

  const stampPop = pop(190);
  const titleFade = ramp(206, 18);

  // note fades (opacity only — leaders stay anchored to their parts)
  const nMembrane = ramp(64, 14);
  const nNucleus = ramp(78, 14);
  const nFood = ramp(92, 14);
  const nContractile = ramp(106, 14);
  const nCytoplasm = ramp(120, 14);
  const nPseudopod = ramp(150, 14);
  const specDraw = ramp(168, 18);
  const specText = ramp(172, 14);

  return (
    <AbsoluteFill style={{backgroundColor: '#143A66'}}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        {/* bg ---------------------------------------------------------- */}
        <g>
          <rect width="1920" height="1080" fill="#143A66" />
          <g stroke="#FFFFFF" strokeOpacity={0.06} strokeWidth={1}>
            <path d="M 96 0 V 1080 M 192 0 V 1080 M 288 0 V 1080 M 384 0 V 1080 M 480 0 V 1080 M 576 0 V 1080 M 672 0 V 1080 M 768 0 V 1080 M 864 0 V 1080 M 960 0 V 1080 M 1056 0 V 1080 M 1152 0 V 1080 M 1248 0 V 1080 M 1344 0 V 1080 M 1440 0 V 1080 M 1536 0 V 1080 M 1632 0 V 1080 M 1728 0 V 1080 M 1824 0 V 1080" />
            <path d="M 0 90 H 1920 M 0 180 H 1920 M 0 270 H 1920 M 0 360 H 1920 M 0 450 H 1920 M 0 540 H 1920 M 0 630 H 1920 M 0 720 H 1920 M 0 810 H 1920 M 0 900 H 1920 M 0 990 H 1920" />
          </g>
        </g>

        {/* everything else breathes together so leaders stay aligned --- */}
        <g transform={aliveT}>
          {/* structure ----------------------------------------------- */}
          {/* cell membrane — draws on */}
          <path
            d="M 560 310 C 640 300 700 320 740 360 C 770 392 800 410 840 430 C 860 440 874 446 900 446 C 1000 432 1090 430 1158 452 C 1176 460 1174 484 1150 492 C 1080 510 1000 508 905 512 C 872 522 858 560 852 610 C 846 690 812 760 740 792 C 672 824 596 826 528 806 C 470 788 430 800 388 770 C 340 738 318 690 314 632 C 308 568 300 520 330 470 C 356 426 372 372 430 348 C 472 330 516 314 560 310 Z"
            fill="none"
            stroke={WHITE}
            strokeWidth={3}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - membraneDraw}
          />
          {/* cytoplasm contour — dashed, revealed by fade */}
          <path
            d="M 562 350 C 632 342 690 360 726 396 C 752 424 778 438 812 452 C 832 462 848 472 860 482 C 846 552 838 636 768 728 C 700 776 600 778 530 760 C 466 744 414 752 378 698 C 344 654 348 600 352 552 C 356 500 362 446 414 422 C 460 400 506 396 540 388 C 552 372 556 360 562 350 Z"
            fill="none"
            stroke={WHITE}
            strokeWidth={1.5}
            strokeDasharray="6 9"
            strokeOpacity={0.7 * contourFade}
          />
          {/* nucleus — pop */}
          <g transform={`translate(580 470) scale(${nucleusPop})`}>
            <circle r={48} fill="none" stroke={WHITE} strokeWidth={2.5} />
            <circle r={15} fill={WHITE} />
            <circle cx={-24} cy={14} r={3} fill={WHITE} />
            <circle cx={22} cy={-18} r={3} fill={WHITE} />
            <circle cx={18} cy={22} r={2.5} fill={WHITE} />
          </g>
          {/* contractile vacuole — pop + water-bailing pulse */}
          <g transform={`translate(430 615) scale(${cvPop * cvPulse})`}>
            <circle r={26} fill="none" stroke={WHITE} strokeWidth={2.5} />
            <path
              d="M 0 -38 V -30 M 27 -27 l 6 -6 M 38 0 H 30 M 27 27 l 6 6 M 0 38 V 30 M -27 27 l -6 6 M -38 0 H -30 M -27 -27 l -6 -6"
              stroke={WHITE}
              strokeWidth={1.5}
            />
          </g>
          {/* food vacuole — pop */}
          <g transform={`translate(745 560) scale(${foodPop})`}>
            <circle r={30} fill="none" stroke={WHITE} strokeWidth={2.5} />
            <path
              d="M -8 -6 q 10 -8 16 2 q 6 10 -4 14 q -12 4 -14 -6 q -2 -8 2 -10 Z"
              fill={WHITE}
            />
          </g>

          {/* flows — amber cytoplasm streaming into the pseudopod ----- */}
          <g opacity={flowFade}>
            <path
              d="M 902 482 C 978 470 1042 468 1110 470"
              fill="none"
              stroke={AMBER}
              strokeWidth={3}
              strokeDasharray="14 10"
              strokeDashoffset={streamOffset}
            />
            <path
              d="M 1110 470 l -18 -8 M 1110 470 l -16 11"
              fill="none"
              stroke={AMBER}
              strokeWidth={3}
            />
          </g>

          {/* furniture: dimension line measures the pseudopod (performer) */}
          <g transform="translate(1027 628)">
            <path
              d="M -127 -120 V -8 M 128 -134 V -8"
              stroke={WHITE}
              strokeWidth={1.5}
              strokeOpacity={0.85 * dimExt}
            />
            <path
              d="M -127 0 H 128"
              stroke={WHITE}
              strokeWidth={2}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - dimBase}
            />
            <path
              d="M -127 0 l 16 -7 M -127 0 l 16 7 M 128 0 l -16 -7 M 128 0 l -16 7"
              stroke={WHITE}
              strokeWidth={2}
              opacity={dimArrows}
            />
            <text
              y={-12}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={24}
              fill={WHITE}
              opacity={dimLabel}
            >
              REACH: 1/4 LUNCH
            </text>
          </g>

          {/* furniture: REV ∞ stamp — pops in */}
          <g transform={`translate(1560 210) rotate(-8) scale(${stampPop})`}>
            <circle r={78} fill="none" stroke={RED} strokeWidth={3} />
            <circle r={62} fill="none" stroke={RED} strokeWidth={1.5} />
            <text y={10} textAnchor="middle" fontFamily={FONT} fontSize={30} fill={RED}>
              REV ∞
            </text>
          </g>

          {/* furniture: title block — fades */}
          <g transform="translate(1620 990)" opacity={titleFade}>
            <rect x={-150} y={-50} width={300} height={100} fill="none" stroke={WHITE} strokeWidth={2} />
            <path d="M -150 -16 H 150 M -150 18 H 150" stroke={WHITE} strokeWidth={1.5} />
            <text y={-26} textAnchor="middle" fontFamily={FONT} fontSize={22} fill={WHITE}>AMOEBA, PLAN</text>
            <text y={6} textAnchor="middle" fontFamily={FONT} fontSize={18} fill={WHITE}>DWG NO. PROTO-001</text>
            <text y={40} textAnchor="middle" fontFamily={FONT} fontSize={16} fill={WHITE}>SCALE: 1 CELL = 1 SHEET</text>
          </g>

          {/* annotations (fade-only so leaders stay on their parts) --- */}
          <g transform="translate(70 290)" opacity={nMembrane}>
            <text fontFamily={FONT} fontSize={24} fill={WHITE}>CELL MEMBRANE</text>
            <path d="M 244 8 C 290 32 322 60 300 112 M 300 112 l 12 -14 M 300 112 l -16 -4" fill="none" stroke={WHITE} strokeWidth={2} />
          </g>
          <g transform="translate(1210 320)" opacity={nPseudopod}>
            <text fontFamily={FONT} fontSize={24} fill={WHITE}>PSEUDOPOD</text>
            <text y={28} fontFamily={FONT} fontSize={20} fill={WHITE}>(FALSE FOOT)</text>
            <path d="M -10 -4 C -80 50 -130 90 -156 116 M -156 116 l 18 -3 M -156 116 l 4 -18" fill="none" stroke={WHITE} strokeWidth={2} />
          </g>
          <g transform="translate(580 392)" opacity={nNucleus}>
            <text textAnchor="middle" fontFamily={FONT} fontSize={22} fill={WHITE}>NUCLEUS</text>
            <path d="M 0 8 V 24" fill="none" stroke={WHITE} strokeWidth={2} />
          </g>
          <g transform="translate(415 522)" opacity={nContractile}>
            <text textAnchor="middle" fontFamily={FONT} fontSize={19} fill={WHITE}>CONTRACTILE</text>
            <text y={22} textAnchor="middle" fontFamily={FONT} fontSize={19} fill={WHITE}>VACUOLE</text>
            <path d="M 6 30 C 10 52 14 66 14 80 M 14 80 l 8 -12 M 14 80 l -12 -6" fill="none" stroke={WHITE} strokeWidth={2} />
          </g>
          <g transform="translate(745 490)" opacity={nFood}>
            <text textAnchor="middle" fontFamily={FONT} fontSize={20} fill={WHITE}>FOOD VACUOLE</text>
            <path d="M 0 8 V 36" fill="none" stroke={WHITE} strokeWidth={2} />
          </g>
          <g transform="translate(545 700)" opacity={nCytoplasm}>
            <text textAnchor="middle" fontFamily={FONT} fontSize={20} fill={WHITE}>CYTOPLASM</text>
            <path d="M -36 -12 C -52 -44 -62 -70 -70 -92 M -70 -92 l -2 16 M -70 -92 l 14 8" fill="none" stroke={WHITE} strokeWidth={2} />
          </g>
          {/* redline note — leader draws on, then text fades (emphasis) */}
          <g transform="translate(1190 540)">
            <text fontFamily={FONT} fontSize={24} fill={RED} opacity={specText}>SHAPE: NOT TO SPEC</text>
            <path
              d="M -12 -14 C -28 -32 -34 -44 -32 -56 M -32 -56 l -10 12 M -32 -56 l 12 6"
              fill="none"
              stroke={RED}
              strokeWidth={2}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - specDraw}
            />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
