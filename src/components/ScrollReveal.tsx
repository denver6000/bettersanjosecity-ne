'use client';

import { useEffect } from 'react';

const TARGETS = '[data-reveal], [data-reveal-children]';

/**
 * Fades marked blocks up once as they scroll into view. Mark a block `data-reveal` (it fades itself)
 * or `data-reveal-children` (its children fade in a stagger). Content is hidden only while `html` has
 * `motion-ok`, which this adds after setup and only when the visitor allows motion; with no JS, or
 * reduced motion, nothing is ever hidden (see styles/motion.css). Blocks already on screen are left
 * as they are so nothing blinks; blocks that appear later (fetched content) are picked up too.
 */
export default function ScrollReveal() {
  useEffect(() => {
    if (
      !window.matchMedia('(prefers-reduced-motion: no-preference)').matches ||
      !('IntersectionObserver' in window)
    ) {
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const { isIntersecting, target } of entries) {
          if (!isIntersecting) continue;
          target.classList.add('is-in');
          io.unobserve(target);
        }
      },
      { rootMargin: '0px 0px -8% 0px' }
    );
    const watch = (root: ParentNode) => {
      // Inner pages: each top-level block of the page body fades in on its own, with no markup needed.
      root
        .querySelectorAll('.page-content > :not([data-reveal], [data-reveal-children])')
        .forEach((el) => el.setAttribute('data-reveal', ''));
      root.querySelectorAll(TARGETS).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in', 'is-static');
        else io.observe(el);
      });
    };
    watch(document);
    document.documentElement.classList.add('motion-ok');
    const late = new MutationObserver((records) => {
      for (const { addedNodes } of records) {
        addedNodes.forEach((n) => n instanceof Element && watch(n.parentNode ?? n));
      }
    });
    late.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      late.disconnect();
    };
  }, []);
  return null;
}
