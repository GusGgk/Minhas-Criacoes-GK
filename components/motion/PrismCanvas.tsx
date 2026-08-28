'use client';

import { useEffect, useRef } from 'react';
import type { Locale } from '@/lib/content/types';

type Point3D = { x: number; y: number; z: number };
type Edge = [number, number];

function createMesh() {
  const points: Point3D[] = [];
  const edges: Edge[] = [];
  const latitudes = 9;
  const longitudes = 16;

  for (let lat = 0; lat <= latitudes; lat += 1) {
    const phi = (lat / latitudes - 0.5) * Math.PI;
    const radius = Math.cos(phi);
    for (let lon = 0; lon < longitudes; lon += 1) {
      const theta = (lon / longitudes) * Math.PI * 2;
      const ripple = 1 + 0.11 * Math.sin(theta * 3 + phi * 2);
      points.push({
        x: Math.cos(theta) * radius * ripple,
        y: Math.sin(phi) * 1.18,
        z: Math.sin(theta) * radius * ripple,
      });
      const current = lat * longitudes + lon;
      edges.push([current, lat * longitudes + ((lon + 1) % longitudes)]);
      if (lat < latitudes) edges.push([current, current + longitudes]);
    }
  }

  return { points, edges };
}

const mesh = createMesh();

export function PrismCanvas({ locale }: { locale: Locale }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let visible = true;
    let width = 0;
    let height = 0;
    let rotationX = -0.16;
    let rotationY = 0.55;
    let targetX = rotationX;
    let targetY = rotationY;
    let time = 0;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      targetY = 0.55 + nx * 0.75;
      targetX = -0.16 - ny * 0.5;
    };

    const onPointerLeave = () => {
      targetX = -0.16;
      targetY = 0.55 + window.scrollY * 0.00035;
    };

    const onScroll = () => {
      if (!wrap.matches(':hover')) targetY = 0.55 + window.scrollY * 0.00035;
    };

    const rotate = (point: Point3D) => {
      const cy = Math.cos(rotationY);
      const sy = Math.sin(rotationY);
      const cx = Math.cos(rotationX);
      const sx = Math.sin(rotationX);
      const x = point.x * cy - point.z * sy;
      const z1 = point.x * sy + point.z * cy;
      const y = point.y * cx - z1 * sx;
      const z = point.y * sx + z1 * cx;
      return { x, y, z };
    };

    const draw = () => {
      frame = 0;
      if (!visible || width === 0 || height === 0) return;

      rotationX += (targetX - rotationX) * 0.055;
      rotationY += (targetY - rotationY) * 0.055;
      if (!reduced) time += 0.006;

      context.clearRect(0, 0, width, height);
      const scale = Math.min(width, height) * 0.33;
      const projected = mesh.points.map((point, index) => {
        const breath = 1 + Math.sin(time * 2 + index * 0.11) * 0.008;
        const rotated = rotate({ x: point.x * breath, y: point.y * breath, z: point.z * breath });
        const perspective = 3.8 / (4.5 + rotated.z);
        return {
          x: width / 2 + rotated.x * scale * perspective,
          y: height / 2 + rotated.y * scale * perspective,
          z: rotated.z,
          alpha: Math.max(0.08, Math.min(0.72, (rotated.z + 1.4) / 3)),
        };
      });

      context.lineWidth = 0.85;
      for (const [from, to] of mesh.edges) {
        const a = projected[from];
        const b = projected[to];
        const depth = (a.alpha + b.alpha) / 2;
        context.strokeStyle = `rgba(243, 236, 226, ${depth * 0.48})`;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }

      const ringRadius = Math.min(width, height) * 0.285;
      context.strokeStyle = 'rgba(255, 107, 74, 0.4)';
      context.lineWidth = 1;
      context.beginPath();
      context.ellipse(width / 2, height / 2, ringRadius, ringRadius * 0.27, -0.32, 0, Math.PI * 2);
      context.stroke();

      const pulse = reduced ? 2.5 : 2.5 + Math.sin(time * 4) * 0.9;
      context.fillStyle = '#ff6b4a';
      context.shadowBlur = 18;
      context.shadowColor = '#ff6b4a';
      context.beginPath();
      context.arc(width * 0.73, height * 0.32, pulse, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;

      if (!reduced || Math.abs(targetX - rotationX) > 0.001 || Math.abs(targetY - rotationY) > 0.001) {
        frame = window.requestAnimationFrame(draw);
      }
    };

    const requestDraw = () => {
      if (!frame) frame = window.requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      requestDraw();
    });
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) requestDraw();
    }, { rootMargin: '120px' });

    resizeObserver.observe(wrap);
    intersectionObserver.observe(wrap);
    wrap.addEventListener('pointermove', onPointerMove);
    wrap.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    resize();
    requestDraw();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      wrap.removeEventListener('pointermove', onPointerMove);
      wrap.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div ref={wrapRef} className="prism" aria-hidden="true">
      <div className="prism__halo" />
      <canvas ref={canvasRef} className="prism__canvas" />
      <span className="prism__label prism__label--top">{locale === 'pt' ? 'VÍDEO' : 'VIDEO'}</span>
      <span className="prism__label prism__label--right">{locale === 'pt' ? 'MARCA' : 'BRAND'}</span>
      <span className="prism__label prism__label--bottom">{locale === 'pt' ? 'FUTEBOL' : 'FOOTBALL'}</span>
      <span className="prism__label prism__label--left">{locale === 'pt' ? 'ESTUDOS' : 'STUDIES'}</span>
    </div>
  );
}
