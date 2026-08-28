'use client';

/* eslint-disable @next/next/no-img-element -- CMS and R2 images have user-defined dimensions and are lazy-loaded below the fold. */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';
import type { Locale, Project } from '@/lib/content/types';

gsap.registerPlugin(ScrollTrigger);

function ProjectCard({ project, locale, large = false }: { project: Project; locale: Locale; large?: boolean }) {
  const Wrapper = project.href ? 'a' : 'article';
  const externalProps = project.href ? { href: project.href, target: '_blank', rel: 'noreferrer' } : {};

  return (
    <Wrapper
      className={`project-card ${large ? 'project-card--large' : ''}`}
      style={{ '--project-accent': project.accent } as React.CSSProperties}
      {...externalProps}
    >
      <div className="project-card__media">
        <img src={project.image} alt={project.alt[locale]} loading="lazy" decoding="async" />
        <span className="project-card__number">{String(project.position + 1).padStart(2, '0')}</span>
        {project.href && <span className="project-card__arrow" aria-hidden="true">↗</span>}
      </div>
      <div className="project-card__copy">
        <div className="project-card__meta"><span>{project.category[locale]}</span><span>{project.year}</span></div>
        <h3>{project.title[locale]}</h3>
        <p>{project.summary[locale]}</p>
        <div className="project-card__tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        {project.metrics && (
          <div className="project-card__metrics">
            {project.metrics.map((metric) => <span key={metric.id}><strong>{metric.value}</strong>{metric.label[locale]}</span>)}
          </div>
        )}
      </div>
    </Wrapper>
  );
}

export function ProjectArchive({ locale, projects }: { locale: Locale; projects: Project[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const visible = projects.filter((project) => project.visible).sort((a, b) => a.position - b.position);
  const featured = visible.filter((project) => project.featured);
  const regular = visible.filter((project) => !project.featured);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.project-card').forEach((card) => {
        gsap.from(card, {
          y: 72,
          opacity: 0,
          duration: 1.15,
          ease: 'power4.out',
          scrollTrigger: { trigger: card, start: 'top 88%', once: true },
        });
        const image = card.querySelector('img');
        if (image) gsap.fromTo(image, { scale: 1.13 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 0.7 } });
      });
    }, section);
    return () => context.revert();
  }, [projects]);

  return (
    <section ref={sectionRef} className="projects" aria-labelledby="projects-title">
      <header className="projects__header">
        <p className="section-kicker">{locale === 'pt' ? 'O QUE JÁ SAIU DA CABEÇA' : 'THINGS THAT MADE IT OUT OF MY HEAD'}</p>
        <h2 id="projects-title">{locale === 'pt' ? 'Sério, estranho, útil ou só divertido.' : 'Serious, strange, useful or simply fun.'}</h2>
        <p>{locale === 'pt' ? 'Aqui cabem o canal que alcançou milhões, um jogo cheio de piadas internas, sistemas para estudar e lembranças que eu quis guardar.' : 'There is room here for a channel that reached millions, a game full of inside jokes, systems for studying and memories I wanted to keep.'}</p>
      </header>

      <div className="projects__featured">
        {featured.map((project) => <ProjectCard key={project.id} project={project} locale={locale} large />)}
      </div>
      <div className="projects__grid">
        {regular.map((project) => <ProjectCard key={project.id} project={project} locale={locale} />)}
      </div>
    </section>
  );
}
