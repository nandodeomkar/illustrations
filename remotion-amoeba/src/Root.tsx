import {Composition} from 'remotion';
import {AmoebaBlueprint} from './AmoebaBlueprint';
import {JacintaTalk} from './JacintaTalk';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AmoebaBlueprint"
        component={AmoebaBlueprint}
        durationInFrames={390}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="JacintaTalk"
        component={JacintaTalk}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
