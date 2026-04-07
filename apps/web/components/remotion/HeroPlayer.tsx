'use client';

import { Player } from '@remotion/player';
import { HeroDashboardComposition } from './HeroDashboard';

export default function HeroPlayer() {
  return (
    <Player
      component={HeroDashboardComposition}
      durationInFrames={150}
      compositionWidth={560}
      compositionHeight={420}
      fps={30}
      loop
      autoPlay
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 12,
      }}
      controls={false}
      showPosterWhenUnplayed={false}
    />
  );
}
