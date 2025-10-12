
'use client';

import { useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';

export function Confetti() {
  const refAnimationInstance = useRef<confetti.CreateTypes | null>(null);

  const getInstance = useCallback((instance: HTMLCanvasElement | null) => {
    if (instance) {
      refAnimationInstance.current = confetti.create(instance, {
        useWorker: true,
        resize: true,
      });
    }
  }, []);

  const makeShot = useCallback((particleRatio: number, opts: confetti.Options) => {
    refAnimationInstance.current &&
      refAnimationInstance.current({
        ...opts,
        origin: { y: 0.7 },
        particleCount: Math.floor(200 * particleRatio),
      });
  }, []);

  const fire = useCallback(() => {
    makeShot(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    makeShot(0.2, {
      spread: 60,
    });

    makeShot(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    makeShot(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    makeShot(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, [makeShot]);

  useEffect(() => {
    fire();
    const interval = setInterval(fire, 2000);
    setTimeout(() => clearInterval(interval), 5000); // Stop after 5 seconds

    return () => {
        clearInterval(interval);
        if (refAnimationInstance.current) {
            refAnimationInstance.current.reset();
        }
    }
  }, [fire]);

  return (
    <canvas
      ref={getInstance}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  );
}
