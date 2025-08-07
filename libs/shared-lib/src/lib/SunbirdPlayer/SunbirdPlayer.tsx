import React from 'react';
import dynamic from 'next/dynamic';

const Player = dynamic(() => import('@players'), {
  ssr: false,
});

interface SunbirdPlayerProps {
  identifier: string;
}

export const SunbirdPlayer: React.FC<SunbirdPlayerProps> = ({ identifier }) => {
  return (
    <div>
      <Player identifier={identifier} />
    </div>
  );
};

export default SunbirdPlayer;
