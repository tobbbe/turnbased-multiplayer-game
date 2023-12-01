export * from './src/stringUtils'
export * from './src/timeUtils'
export * from './src/arrayUtils'
export * from './src/withApiExceptionFilter'
export * from './src/reflect'

export const getPagination = (page: number | string, size: number) => {
  page = Number(page) - 1 || 0
  const from = page * size
  const to = from + size - 1

  return { from, to }
}
