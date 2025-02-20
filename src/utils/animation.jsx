import React, { useState, useEffect, useRef } from "react";
import img1 from "../images/1.png";
import img2 from "../images/2.png";
import img3 from "../images/3.png";
import img6 from "../images/6.png";
import img7 from "../images/7.png";
import img8 from "../images/8.png";
import img9 from "../images/9.png";
import img10 from "../images/10.png";
import beer1 from "../images/beer1.png";
import beer2 from "../images/beer2.png";
import beer3 from "../images/beer3.png";

const loops = [
  [img1, img2, img3, img2],
  [img6],
  [img6, img7, img8, img8, img9, img10, img10, img10, img9, img8, img7],
];

const preparedLoops = loops.map((loop) =>
  loop.map((url) => {
    const i = new Image();
    i.src = url;
    return i;
  })
);

export function AnimatedSprite({ interval = 150 }) {
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
      className="z-[15] absolute left-[2%] bottom-[-1.5%] w-full h-full pointer-events-none"
      style={{
        backgroundImage: `url(${img.src})`,
        imageRendering: "pixelated",
        backgroundSize: "auto 100%",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}

function Particles({
  beerRef,
  particleColor = "#ff0",
  particleBaseSize = 3,
  particleSizeVariation = 4,
  particleJumpHeight = 35,
  particleAnimationDuration = 1200,
}) {
  const [isActive, setIsActive] = useState(false);
  const [parts, setParts] = useState([]);

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
      const rect = beerRef.current.getBoundingClientRect();
      const left = Math.random() * rect.width;
      const size = particleBaseSize + Math.random() * particleSizeVariation;
      setParts((p) => [...p, { id, left, size }]);
      setTimeout(() => {
        setParts((p) => p.filter((x) => x.id !== id));
      }, particleAnimationDuration);
    }, 200);
    return () => clearInterval(timer);
  }, [isActive, beerRef, particleAnimationDuration]);

  return (
    <div className="absolute inset-0 top-3 pointer-events-none">
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
      <style>{`
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

export function BeerAnimated({
  maxBeers = 5,
  spawnInterval = 1000,
  duration = 4000,
}) {
  const [beers, setBeers] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setBeers((prev) => {
        if (prev.length >= maxBeers) return prev;
        const images = [beer1, beer2, beer3];

        const newBeer = {
          id: Date.now() + Math.random(),
          right: Math.random() * 150 - 120,
          img: images[Math.floor(Math.random() * images.length)], // Escolhe uma imagem aleatória corretamente
          ref: React.createRef(),
          active: false,
        };
        // Ativa a cerveja após 10ms
        setTimeout(() => {
          setBeers((prev) =>
            prev.map((b) => (b.id === newBeer.id ? { ...b, active: true } : b))
          );
        }, 10);

        // Desativa a cerveja e remove após "duration"
        setTimeout(() => {
          setBeers((prev) =>
            prev.map((b) => (b.id === newBeer.id ? { ...b, active: false } : b))
          );
          setTimeout(() => {
            setBeers((p) => p.filter((b) => b.id !== newBeer.id));
          }, 500); // Tempo da transição
        }, duration - 500); // Ajuste para compensar a transição

        return [...prev, newBeer];
      });
    }, spawnInterval);

    return () => clearInterval(intervalId);
  }, [maxBeers, spawnInterval, duration]);

  return (
    <div
      ref={containerRef}
      className="relative top-[50%] w-full h-[40%] pointer-events-none"
    >
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
