'use client';

import type { Category, Creation, Locale } from '@/lib/content/types';

/**
 * The wall of the cabin: every shelf and everything on it, on one surface.
 * No images here on purpose — the index is the page, and the pictures only
 * appear once something is taken down off the wall.
 */
export function CreationsWall({
  categories,
  creations,
  locale,
  onSelect,
}: {
  categories: Category[];
  creations: Creation[];
  locale: Locale;
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="wall" id="parede">
      {categories.map((category) => {
        const items = creations.filter((creation) => creation.categoryId === category.id);
        return (
          <section
            key={category.id}
            className={`shelf ${items.length ? '' : 'shelf--bare'}`}
            style={{ '--tone': category.accent } as React.CSSProperties}
            aria-labelledby={`shelf-${category.id}`}
          >
            <h2 className="shelf__name" id={`shelf-${category.id}`}>
              <i aria-hidden="true" />
              {category.name[locale]}
              <b>{items.length || ''}</b>
            </h2>

            {items.length > 0 ? (
              <ul className="shelf__items">
                {items.map((creation) => (
                  <li key={creation.id}>
                    <button type="button" onClick={() => onSelect(creation.slug)}>
                      <span className="shelf__item-name">{creation.name[locale]}</span>
                      <span className="shelf__item-line">{creation.tagline[locale]}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="shelf__bare">{category.empty?.[locale]}</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
