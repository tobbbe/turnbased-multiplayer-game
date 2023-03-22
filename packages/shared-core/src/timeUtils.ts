function isBetween(datetime: Date, start: Date, end: Date) {
  return end > datetime && start <= datetime
}

function isBefore(datetime: Date, before: Date) {
  return datetime < before
}

function isAfter(datetime: Date, after: Date) {
  return datetime > after
}

export const timeUtils = {
  toSwedishDateTime,
  isBetween,
  isBefore,
  isAfter,
}

function toSwedishDateTime(datetime: string) {
  const _date = new Date(datetime)

  const time = _date.toLocaleTimeString('sv-SE', {
    timeZone: 'Europe/Stockholm',
    hour: 'numeric',
    minute: 'numeric',
  })

  const date = _date.toLocaleDateString('sv-SE', {
    timeZone: 'Europe/Stockholm',
  })

  return `${date} ${time}`
}
