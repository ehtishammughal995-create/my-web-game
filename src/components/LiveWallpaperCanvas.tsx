import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';

export type WallpaperPattern =
  | 'AURORA'
  | 'SPIROGRAPH'
  | 'NEBULA'
  | 'SAKURA_MIST';

export interface LiveWallpaperHandle {
  captureFrame: () => string | null;
}

interface LiveWallpaperCanvasProps {
  pattern: WallpaperPattern;
  flowSpeed: 'calm' | 'flow';
  reducedMotion: boolean;
  interactive?: boolean;
  className?: string;
}

interface BokehNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hueOffset: number;
  phase: number;
}

interface InteractiveRipple {
  x: number;
  y: number;
  r: number;
  maxR: number;
  hue: number;
  alpha: number;
}

export const LiveWallpaperCanvas = forwardRef<
  LiveWallpaperHandle,
  LiveWallpaperCanvasProps
>(function LiveWallpaperCanvas(
  { pattern, flowSpeed, reducedMotion, interactive = true, className = '' },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const propsRef = useRef({ pattern, flowSpeed, reducedMotion, interactive });
  propsRef.current = { pattern, flowSpeed, reducedMotion, interactive };

  const nodesRef = useRef<BokehNode[]>([]);
  const ripplesRef = useRef<InteractiveRipple[]>([]);
  const spiroTrailRef = useRef<
    Array<{ x: number; y: number; hue: number }>
  >([]);

  useImperativeHandle(ref, () => ({
    captureFrame: () => {
      const src = canvasRef.current;
      if (!src) return null;
      try {
        const out = document.createElement('canvas');
        out.width = 480;
        out.height = 372;
        const octx = out.getContext('2d');
        if (!octx) return null;
        const srcAspect = src.width / Math.max(1, src.height);
        const dstAspect = out.width / out.height;
        let sx = 0;
        let sy = 0;
        let sw = src.width;
        let sh = src.height;
        if (srcAspect > dstAspect) {
          sw = src.height * dstAspect;
          sx = (src.width - sw) / 2;
        } else {
          sh = src.width / dstAspect;
          sy = (src.height - sh) / 2;
        }
        octx.drawImage(src, sx, sy, sw, sh, 0, 0, out.width, out.height);
        return out.toDataURL('image/jpeg', 0.88);
      } catch {
        return null;
      }
    },
  }));

  useEffect(() => {
    nodesRef.current = Array.from({ length: 46 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.018,
      vy: (Math.random() - 0.5) * 0.018,
      r: 1.8 + (i % 5) * 1.4,
      hueOffset: i * 9,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  useEffect(() => {
    spiroTrailRef.current = [];
  }, [pattern]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(320, Math.round(rect.width * dpr));
      const h = Math.max(240, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = (now: number) => {
      const rawDt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const { pattern: pat, flowSpeed: spd, reducedMotion: rm } = propsRef.current;
      const speedMul = rm ? 0.18 : spd === 'flow' ? 1.35 : 0.72;
      const dt = rawDt * speedMul;
      elapsed += dt;

      resize();
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;
      const cx = w * 0.5;
      const cy = h * 0.5;
      const minDim = Math.min(w, h);

      // Shifting multi-stop ambient gradient background
      const baseHue = (elapsed * 9 + (pat === 'SAKURA_MIST' ? 310 : pat === 'NEBULA' ? 245 : pat === 'SPIROGRAPH' ? 200 : 175)) % 360;
      const hueA = baseHue;
      const hueB = (baseHue + 52) % 360;
      const hueC = (baseHue + 118) % 360;

      const bgGrad = ctx.createLinearGradient(
        w * (0.2 + 0.25 * Math.sin(elapsed * 0.17)),
        0,
        w * (0.8 + 0.2 * Math.cos(elapsed * 0.13)),
        h
      );
      bgGrad.addColorStop(0, `hsl(${hueA}, 46%, 9%)`);
      bgGrad.addColorStop(0.5, `hsl(${hueB}, 42%, 11%)`);
      bgGrad.addColorStop(1, `hsl(${hueC}, 48%, 8%)`);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Soft drifting ambient radial blooms
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 3; i++) {
        const bx = cx + Math.sin(elapsed * (0.21 + i * 0.08) + i * 2.1) * w * 0.28;
        const by = cy + Math.cos(elapsed * (0.17 + i * 0.06) + i * 1.6) * h * 0.25;
        const br = minDim * (0.48 + i * 0.1);
        const rad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        const orbHue = (baseHue + i * 48) % 360;
        rad.addColorStop(0, `hsla(${orbHue}, 82%, 56%, 0.22)`);
        rad.addColorStop(0.55, `hsla(${(orbHue + 25) % 360}, 76%, 44%, 0.08)`);
        rad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, w, h);
      }

      if (pat === 'AURORA') {
        const layers = 5;
        for (let l = 0; l < layers; l++) {
          const yBase = h * (0.34 + l * 0.09);
          const amp = h * (0.08 + l * 0.015);
          const layerHue = (baseHue + l * 26) % 360;
          ctx.beginPath();
          const steps = 48;
          for (let s = 0; s <= steps; s++) {
            const t = s / steps;
            const x = t * w;
            const wave =
              Math.sin(t * 4.4 + elapsed * (0.55 + l * 0.12) + l) * amp +
              Math.cos(t * 7.8 - elapsed * (0.38 + l * 0.08)) * (amp * 0.45);
            const y = yBase + wave;
            if (s === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = `hsla(${layerHue}, 88%, 68%, ${0.26 - l * 0.03})`;
          ctx.lineWidth = Math.max(2, minDim * 0.018);
          ctx.lineCap = 'round';
          ctx.stroke();

          ctx.lineTo(w, h);
          ctx.lineTo(0, h);
          ctx.closePath();
          const ribbonFill = ctx.createLinearGradient(0, yBase - amp, 0, h);
          ribbonFill.addColorStop(0, `hsla(${layerHue}, 86%, 62%, 0.13)`);
          ribbonFill.addColorStop(0.65, `hsla(${(layerHue + 30) % 360}, 76%, 45%, 0.03)`);
          ribbonFill.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = ribbonFill;
          ctx.fill();
        }
      } else if (pat === 'SPIROGRAPH') {
        const r1 = minDim * 0.25;
        const r2 = minDim * 0.14;
        const subSteps = rm ? 1 : 3;
        for (let s = 0; s < subSteps; s++) {
          const t = elapsed * 0.9 + s * 0.014;
          const ratio = 2.618 + Math.sin(elapsed * 0.06) * 0.12;
          const px =
            cx +
            Math.cos(t) * r1 +
            Math.cos(-t * ratio) * r2 * Math.cos(elapsed * 0.12);
          const py =
            cy +
            Math.sin(t) * r1 +
            Math.sin(-t * ratio) * r2 +
            Math.sin(t * 1.5) * (minDim * 0.05);
          spiroTrailRef.current.push({
            x: px,
            y: py,
            hue: (baseHue + t * 24) % 360,
          });
        }
        if (spiroTrailRef.current.length > 520) {
          spiroTrailRef.current.splice(0, spiroTrailRef.current.length - 520);
        }

        const pts = spiroTrailRef.current;
        for (let i = 1; i < pts.length; i++) {
          const prev = pts[i - 1];
          const curr = pts[i];
          const life = i / pts.length;
          ctx.strokeStyle = `hsla(${curr.hue}, 92%, 68%, ${life * 0.62})`;
          ctx.lineWidth = Math.max(1.5, minDim * 0.004 * (0.4 + life));
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.stroke();
        }
        if (pts.length > 0) {
          const head = pts[pts.length - 1];
          const glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, minDim * 0.045);
          glow.addColorStop(0, '#FFFFFF');
          glow.addColorStop(0.35, `hsla(${head.hue}, 95%, 72%, 0.85)`);
          glow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(head.x, head.y, minDim * 0.045, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (pat === 'NEBULA') {
        const nodes = nodesRef.current;
        const maxDist = minDim * 0.22;
        for (let i = 0; i < nodes.length; i++) {
          const a = nodes[i];
          const ax = a.x * w;
          const ay = a.y * h;
          for (let j = i + 1; j < nodes.length; j++) {
            const b = nodes[j];
            const bx = b.x * w;
            const by = b.y * h;
            const dist = Math.hypot(bx - ax, by - ay);
            if (dist < maxDist) {
              const alpha = (1 - dist / maxDist) * 0.26;
              ctx.strokeStyle = `hsla(${(baseHue + a.hueOffset) % 360}, 85%, 72%, ${alpha})`;
              ctx.lineWidth = Math.max(1, minDim * 0.002);
              ctx.beginPath();
              ctx.moveTo(ax, ay);
              ctx.lineTo(bx, by);
              ctx.stroke();
            }
          }
        }
      } else if (pat === 'SAKURA_MIST') {
        // Gentle ambient pond ripples on idle timer
        if (Math.random() < dt * 1.4 && ripplesRef.current.length < 18) {
          ripplesRef.current.push({
            x: (0.12 + Math.random() * 0.76) * w,
            y: (0.14 + Math.random() * 0.72) * h,
            r: 4,
            maxR: minDim * (0.1 + Math.random() * 0.14),
            hue: (325 + Math.random() * 50) % 360,
            alpha: 0.52,
          });
        }
      }

      // Drifting luminous bokeh / petals across all themes
      const nodes = nodesRef.current;
      for (const n of nodes) {
        n.x += n.vx * dt + Math.sin(elapsed * 0.5 + n.phase) * 0.004 * dt;
        n.y +=
          (pat === 'SAKURA_MIST' ? Math.abs(n.vy) + 0.012 : n.vy) * dt +
          Math.cos(elapsed * 0.4 + n.phase) * 0.003 * dt;

        if (n.x < -0.05) n.x = 1.05;
        if (n.x > 1.05) n.x = -0.05;
        if (n.y < -0.05) n.y = 1.05;
        if (n.y > 1.05) n.y = -0.05;

        const px = n.x * w;
        const py = n.y * h;
        const pulse = 0.65 + 0.35 * Math.sin(elapsed * 1.6 + n.phase);
        const rad = n.r * (minDim / 620) * (pat === 'NEBULA' ? 1.5 : 1.15);
        const nHue = pat === 'SAKURA_MIST' ? 328 + (n.hueOffset % 45) : (baseHue + n.hueOffset) % 360;

        if (pat === 'SAKURA_MIST') {
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(elapsed * 0.5 + n.phase);
          ctx.fillStyle = `hsla(${nHue}, 85%, 78%, ${0.42 * pulse})`;
          ctx.beginPath();
          ctx.ellipse(0, 0, rad * 1.7, rad * 0.9, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          const glow = ctx.createRadialGradient(px, py, 0, px, py, rad * 3.2);
          glow.addColorStop(0, `hsla(${nHue}, 92%, 78%, ${0.65 * pulse})`);
          glow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(px, py, rad * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Expanding interactive/ambient ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const rp = ripplesRef.current[i];
        rp.r += (rp.maxR - rp.r) * Math.min(1, dt * 1.8) + minDim * 0.04 * dt;
        rp.alpha -= dt * 0.24;
        if (rp.alpha <= 0 || rp.r >= rp.maxR) {
          ripplesRef.current.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `hsla(${rp.hue}, 90%, 74%, ${rp.alpha})`;
        ctx.lineWidth = Math.max(1.2, minDim * 0.0025);
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const spawnPointerRipple = (clientX: number, clientY: number, strong: boolean) => {
    if (!propsRef.current.interactive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / Math.max(1, rect.width)) * canvas.width;
    const y = ((clientY - rect.top) / Math.max(1, rect.height)) * canvas.height;
    if (ripplesRef.current.length > 26) ripplesRef.current.shift();
    ripplesRef.current.push({
      x,
      y,
      r: 4,
      maxR: Math.min(canvas.width, canvas.height) * (strong ? 0.22 : 0.12),
      hue: (Date.now() * 0.05) % 360,
      alpha: strong ? 0.72 : 0.35,
    });
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={(e) => spawnPointerRipple(e.clientX, e.clientY, true)}
      onPointerMove={(e) => {
        if (Math.random() < 0.16) spawnPointerRipple(e.clientX, e.clientY, false);
      }}
      className={`block h-full w-full ${className}`}
    />
  );
});
