export function insertOrRemove(items: string[], item: string) {
  return items.some((x) => x === item) ? items.filter((x) => x !== item) : [...items, item]
}
