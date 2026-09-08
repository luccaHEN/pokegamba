import { memo } from 'react';

const MinecraftBackground = memo(() => {
  return (
    <>
      <div 
        className="fixed inset-0 z-[-2] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/bg-voxel-forest.jpg)' }}
      />
      <div className="fixed inset-0 z-[-1] bg-cobble-900/60 backdrop-blur-[2px] pointer-events-none" />
    </>
  );
});

export default MinecraftBackground;
