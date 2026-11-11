/** Printed PH number -> `tel:` value: digits only, a leading 0 becomes +63; short codes (911) stay. */
export function toTel(display: string): string {
  const digits = display.replace(/\D/g, '');
  return digits.startsWith('0') ? `+63${digits.slice(1)}` : digits;
}
