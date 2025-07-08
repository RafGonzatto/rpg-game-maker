'use client'

import React, { useState, useEffect, useRef } from "react";

interface ParticlesProps {
  beerRef: React.RefObject<HTMLDivElement>;
  particleColor?: string;
  particleBaseSize?: number;
  particleSizeVariation?: number;
  particleJumpHeight?: number;
  particleAnimationDuration?: number;
}

function Particles({
  beerRef,
  particleColor = "#ff0",
  particleBaseSize = 3,
  particleSizeVariation = 4,
  particleJumpHeight = 35,
  particleAnimationDuration = 1200,
}: ParticlesProps) {
  const [isActive, setIsActive] = useState(false);
  const [parts, setParts] = useState<Array<{ id: number; left: number; size: number }>>([]);

  useEffect(() => {
    if (!beerRef.current) return;
    const activationTimer = setTimeout(() => {
      setIsActive(true);
    }, 50);
    return () => clearTimeout(activationTimer);
  }, [beerRef]);

  useEffect(() => {
    if (!isActive || !beerRef.current) return;
    const timer = setInterval(() => {
      const id = Date.now();
      const rect = beerRef.current!.getBoundingClientRect();
      const left = Math.random() * rect.width;
      const size = particleBaseSize + Math.random() * particleSizeVariation;
      setParts((p) => [...p, { id, left, size }]);
      setTimeout(() => {
        setParts((p) => p.filter((x) => x.id !== id));
      }, particleAnimationDuration);
    }, 200);
    return () => clearInterval(timer);
  }, [isActive, beerRef, particleAnimationDuration, particleBaseSize, particleSizeVariation]);

  return (
    <div className="absolute inset-0 top-3">
      {parts.map((p) => (
        <div
          key={p.id}
          style={{
            left: `${p.left}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: particleColor,
          }}
          className="particle"
        />
      ))}
      <style jsx>{`
        .particle {
          position: absolute;
          top: 0;
          image-rendering: pixelated;
          animation: jump ${particleAnimationDuration}ms forwards;
        }
        @keyframes jump {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-${particleJumpHeight}px) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

interface BeerAnimatedProps {
  maxBeers?: number;
  spawnInterval?: number;
  duration?: number;
}

export function BeerAnimated({
  maxBeers = 5,
  spawnInterval = 1000,
  duration = 4000,
}: BeerAnimatedProps) {
  const [beers, setBeers] = useState<Array<{
    id: number;
    right: number;
    img: string;
    ref: React.RefObject<HTMLDivElement>;
    active: boolean;
  }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setBeers((prev) => {
        if (prev.length >= maxBeers) return prev;
        const images = ["/images/beer1.png", "/images/beer2.png", "/images/beer3.png"];
        const newBeer = {
          id: Date.now() + Math.random(),
          right: Math.random() * 150 - 120,
          img: images[Math.floor(Math.random() * images.length)],
          ref: React.createRef<HTMLDivElement>(),
          active: false,
        };
        
        setTimeout(() => {
          setBeers((prev) =>
            prev.map((b) => (b.id === newBeer.id ? { ...b, active: true } : b))
          );
        }, 10);
        
        setTimeout(() => {
          setBeers((prev) =>
            prev.map((b) => (b.id === newBeer.id ? { ...b, active: false } : b))
          );
          setTimeout(() => {
            setBeers((p) => p.filter((b) => b.id !== newBeer.id));
          }, 500);
        }, duration - 500);
        
        return [...prev, newBeer];
      });
    }, spawnInterval);
    return () => clearInterval(intervalId);
  }, [maxBeers, spawnInterval, duration]);

  return (
    <div ref={containerRef} className="relative top-[51%] w-full h-[40%]">
      {beers.map((b) => (
        <div
          key={b.id}
          ref={b.ref}
          className="z-[10] absolute h-full"
          style={{
            right: `${b.right}%`,
            width: `${(b.ref.current?.clientHeight || 0) * 1}px`,
            backgroundImage: `url(${b.img})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            imageRendering: "pixelated",
            opacity: b.active ? 1 : 0,
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {b.active && (
            <Particles
              beerRef={b.ref}
              particleColor="#ff0"
              particleBaseSize={3}
              particleSizeVariation={4}
              particleJumpHeight={35}
              particleAnimationDuration={1200}
            />
          )}
        </div>
      ))}
    </div>
  );
}
