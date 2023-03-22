function stringToId(prefix: string | undefined = 'unknown', id: string | undefined = 'unknown') {
  return `${toSlug(prefix, { spaceSub: 'lodash' })}:${toSlug(id, { spaceSub: 'lodash' })}`
}

function toSlug(str: string, options?: { spaceSub?: 'dash' | 'lodash' }) {
  return str
    .replaceAll('å', 'a')
    .replaceAll('ä', 'a')
    .replaceAll('ö', 'o')
    .replaceAll('ö', 'o')
    .replaceAll(' ', options?.spaceSub === 'lodash' ? '_' : '-')
    .replaceAll('/', '-')
    .replace(/[^A-Za-z0-9_.-]/g, '')
    .toLowerCase()
}
function templateString(str: string, replacements: Record<string, unknown>) {
  Object.keys(replacements).forEach((key) => {
    const newVal = replacements[key]
    if (newVal && typeof newVal === 'string') {
      str = str.replaceAll(`{${key}}`, newVal)
    }
  })
  return str
}

export const stringUtils = {
  templateString,
  stringToId,
  toSlug,
}
