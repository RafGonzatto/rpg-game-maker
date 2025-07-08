'use client'

import React, { useState, useEffect } from "react";

const loops = [
  ["/images/1.png", "/images/2.png", "/images/3.png", "/images/2.png"],
  ["/images/6.png"],
  ["/images/6.png", "/images/7.png", "/images/8.png", "/images/8.png", "/images/9.png", "/images/10.png", "/images/10.png", "/images/10.png", "/images/9.png", "/images/8.png", "/images/7.png"],
];

const preparedLoops = loops.map((loop) =>
  loop.map((url) => {
    if (typeof window !== 'undefined') {
      const i = new Image();
      i.src = url;
      return i;
    }
    return { src: url };
  })
);

interface AnimatedSpriteProps {
  interval?: number;
}

export function AnimatedSprite({ interval = 150 }: AnimatedSpriteProps) {
  const [currentLoop, setCurrentLoop] = useState(
    Math.floor(Math.random() * loops.length)
  );
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((curr) => {
        const loop = preparedLoops[currentLoop];
        if (curr + 1 >= loop.length) {
          setCurrentLoop(Math.floor(Math.random() * loops.length));
          return 0;
        }
        return curr + 1;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [currentLoop, interval]);

  const img = preparedLoops[currentLoop][frame];
  
  return (
    <div
      className="z-[15] absolute left-[2%] bottom-[-1.5%] w-full h-full"
      style={{
        backgroundImage: `url(${img.src})`,
        imageRendering: "pixelated",
        backgroundSize: "auto 100%",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
