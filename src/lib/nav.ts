const trim = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p);

/** Whether a nav link points at the current page: home only on '/', any other link on itself or below it. */
export function isActivePath(pathname: string, href: string): boolean {
  const here = trim(pathname);
  const target = trim(href);
  if (target === '/') return here === '/';
  return here === target || here.startsWith(`${target}/`);
}
