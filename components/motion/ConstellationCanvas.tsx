'use client';

import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/lib/content/types';

const topics = [
  'SQL',
  'Orientação a Objetos',
  'Engenharia de Requisitos',
  'Segurança da Informação',
  'Qualidade de Software',
  'Arquitetura Cloud',
  'DevOps',
  'Big Data',
];

/**
 * The Obsidian vault, drawn with the same wireframe vocabulary as the hero:
 * thin paper-coloured edges, accent nodes, redrawn only while on screen.
 */
export function ConstellationCanvas({ locale, accent = '#68c9ff' }: { locale: Locale; accent?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);

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
    let time = 0;
    let pointer = { x: -999, y: -999 };
    let active = -1;

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

    const layout = () => {
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.36;
      return topics.map((label, index) => {
        const angle = (index / topics.length) * Math.PI * 2 - Math.PI / 2;
        const drift = reduced ? 0 : Math.sin(time * 1.4 + index) * 5;
        return {
          label,
          x: cx + Math.cos(angle) * (radius + drift),
          y: cy + Math.sin(angle) * (radius + drift) * 0.78,
        };
      });
    };

    const draw = () => {
      frame = 0;
      if (!visible || width === 0) return;
      if (!reduced) time += 0.006;

      const nodes = layout();
      const cx = width / 2;
      const cy = height / 2;

      active = -1;
      let best = 26;
      nodes.forEach((node, index) => {
        const distance = Math.hypot(node.x - pointer.x, node.y - pointer.y);
        if (distance < best) { best = distance; active = index; }
      });

      context.clearRect(0, 0, width, height);

      // spokes from the vault core out to each topic
      context.lineWidth = 0.85;
      nodes.forEach((node, index) => {
        context.strokeStyle = index === active
          ? `${accent}cc`
          : 'rgba(243, 236, 226, 0.16)';
        context.beginPath();
        context.moveTo(cx, cy);
        context.lineTo(node.x, node.y);
        context.stroke();
      });

      // the ring that links neighbouring topics
      context.strokeStyle = 'rgba(243, 236, 226, 0.1)';
      context.beginPath();
      nodes.forEach((node, index) => {
        if (index === 0) context.moveTo(node.x, node.y);
        else context.lineTo(node.x, node.y);
      });
      context.closePath();
      context.stroke();

      nodes.forEach((node, index) => {
        const on = index === active;
        context.fillStyle = on ? accent : 'rgba(243, 236, 226, 0.5)';
        if (on) { context.shadowBlur = 16; context.shadowColor = accent; }
        context.beginPath();
        context.arc(node.x, node.y, on ? 5.5 : 3, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;
      });

      const pulse = reduced ? 7 : 7 + Math.sin(time * 3) * 1.4;
      context.strokeStyle = `${accent}88`;
      context.lineWidth = 1;
      context.beginPath();
      context.arc(cx, cy, pulse + 9, 0, Math.PI * 2);
      context.stroke();
      context.fillStyle = accent;
      context.shadowBlur = 20;
      context.shadowColor = accent;
      context.beginPath();
      context.arc(cx, cy, pulse, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;

      setHovered(active >= 0 ? nodes[active].label : null);

      if (!reduced) frame = window.requestAnimationFrame(draw);
    };

    const requestDraw = () => { if (!frame) frame = window.requestAnimationFrame(draw); };

    const onPointerMove = (event: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      requestDraw();
    };
    const onPointerLeave = () => { pointer = { x: -999, y: -999 }; requestDraw(); };

    const resizeObserver = new ResizeObserver(() => { resize(); requestDraw(); });
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) requestDraw();
    }, { rootMargin: '120px' });

    resizeObserver.observe(wrap);
    intersectionObserver.observe(wrap);
    wrap.addEventListener('pointermove', onPointerMove);
    wrap.addEventListener('pointerleave', onPointerLeave);
    resize();
    requestDraw();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      wrap.removeEventListener('pointermove', onPointerMove);
      wrap.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [accent]);

  return (
    <div ref={wrapRef} className="constellation">
      <canvas ref={canvasRef} className="constellation__canvas" aria-hidden="true" />
      <span className="constellation__core" aria-hidden="true">vault</span>
      <p className="constellation__hint">
        {hovered ?? (locale === 'pt' ? 'passe o mouse pelos nós para ver os temas' : 'hover the nodes to see the topics')}
      </p>
    </div>
  );
}
