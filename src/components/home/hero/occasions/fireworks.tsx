// A tiny fireworks engine shared by occasions: flat dots in the colours you give it, never a flag or
// any other shape. State lives in the instance; each render draws what is alive at `tSec`.
const PER_BURST = 24;
const LIFE = 1.8;

interface Burst {
  x: number;
  y: number;
  t0: number;
  hue: number;
}

export function createFireworks(colors: string[], maxParticles = 150) {
  let bursts: Burst[] = [];

  return {
    /** Starts a burst at a point; ignored when it would pass the particle cap. */
    spawn(x: number, y: number, t0: number) {
      bursts = bursts.filter((b) => t0 - b.t0 < LIFE);
      if ((bursts.length + 1) * PER_BURST > maxParticles) return;
      bursts.push({ x, y, t0, hue: Math.floor(Math.random() * colors.length) });
    },
    render(tSec: number) {
      return (
        <g pointerEvents="none">
          {bursts.map((b, n) => {
            const age = tSec - b.t0;
            if (age < 0 || age >= LIFE) return null;
            return Array.from({ length: PER_BURST }, (_, i) => {
              const a = (i / PER_BURST) * Math.PI * 2 + n;
              const speed = 90 + (i % 3) * 45;
              return (
                <circle
                  key={`${n}-${i}`}
                  cx={b.x + Math.cos(a) * speed * age}
                  cy={b.y + Math.sin(a) * speed * age + 70 * age * age}
                  r={5 * (1 - age / (LIFE + 0.4))}
                  fill={colors[(b.hue + i) % colors.length]}
                  opacity={1 - age / LIFE}
                />
              );
            });
          })}
        </g>
      );
    },
  };
}
