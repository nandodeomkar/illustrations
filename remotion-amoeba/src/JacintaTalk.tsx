import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// 2-frame hand-drawn boil: idle <-> talk swapped at low fps.
// Head geometry is identical in both frames, so the face stays
// rock-solid while the gesture arm steps.
const BOIL_FPS = 3;
const TALK_START = 30; // frames before the boil kicks in

const FRAMES = [
  staticFile('jacinta/01-idle.svg'),
  staticFile('jacinta/02-talk.svg'),
];

export const JacintaTalk: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, height} = useVideoConfig();

  // Entrance: rise + fade with a spring.
  const enter = spring({
    frame,
    fps,
    config: {damping: 14, mass: 0.8},
    durationInFrames: 28,
  });
  const slideY = interpolate(enter, [0, 1], [80, 0]);

  // Gentle idle bob so she never feels frozen between boil steps.
  const bob = Math.sin((frame / fps) * Math.PI) * 5;

  // Frame swap.
  const boilIdx =
    frame < TALK_START
      ? 0
      : Math.floor(((frame - TALK_START) * BOIL_FPS) / fps) % FRAMES.length;

  const charHeight = height * 0.85;

  return (
    <AbsoluteFill style={{backgroundColor: '#F7F5F0'}}>
      {/* ground shadow */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: height * 0.875,
          transform: `translateX(-50%) scaleX(${0.9 + enter * 0.1})`,
          width: 300,
          height: 36,
          borderRadius: '50%',
          backgroundColor: 'rgba(31, 27, 22, 0.12)',
          opacity: enter,
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: 'flex-start',
          alignItems: 'center',
          opacity: enter,
          transform: `translateY(${slideY + bob}px)`,
        }}
      >
        <Img
          src={FRAMES[boilIdx]}
          style={{height: charHeight, marginTop: height * 0.06}}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
