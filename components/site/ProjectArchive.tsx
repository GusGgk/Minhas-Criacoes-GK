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

/**
 * Closing section for whatever the CMS holds that no chapter tells in full.
 * Everything already covered by a chapter is skipped here, so the page never
 * repeats the same project twice.
 */
export function ProjectArchive({ locale, projects, coveredSlugs }: { locale: Locale; projects: Project[]; coveredSlugs: string[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const covered = new Set(coveredSlugs);
  const visible = projects
    .filter((project) => project.visible && !covered.has(project.slug))
    .sort((a, b) => a.position - b.position);
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
    <section ref={sectionRef} id="arquivo-aberto" className="projects" aria-labelledby="projects-title">
      <header className="projects__header">
        <p className="section-kicker">{locale === 'pt' ? 'AINDA TEM COISA VINDO' : 'MORE IS COMING'}</p>
        <h2 id="projects-title">
          {visible.length
            ? (locale === 'pt' ? 'Recém-saído do forno.' : 'Fresh out of the oven.')
            : (locale === 'pt' ? 'A próxima criação.' : 'The next thing I make.')}
        </h2>
        <p>
          {visible.length
            ? (locale === 'pt' ? 'Aparecem aqui assim que ficam prontas. Quando a história cresce o bastante, ganham uma seção só delas.' : 'They show up here as soon as they are done. When the story grows enough, they get a section of their own.')
            : (locale === 'pt' ? 'Vou colocando aqui o que for ficando pronto. Por enquanto, tudo o que existe já está contado lá em cima.' : 'I add new work here as it gets done. For now, everything that exists is already told above.')}
        </p>
      </header>

      {visible.length > 0 ? (
        <>
          <div className="projects__featured">
            {featured.map((project) => <ProjectCard key={project.id} project={project} locale={locale} large />)}
          </div>
          <div className="projects__grid">
            {regular.map((project) => <ProjectCard key={project.id} project={project} locale={locale} />)}
          </div>
        </>
      ) : (
        <div className="projects__empty">
          <span aria-hidden="true">+</span>
          <p>{locale === 'pt' ? 'lugar guardado pra próxima' : 'space saved for the next one'}</p>
        </div>
      )}
    </section>
  );
}
