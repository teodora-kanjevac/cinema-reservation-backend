export function formatSeatLabel(seatNumber: number): string {
  if (seatNumber === undefined || seatNumber === null) return ''
  const row = String.fromCharCode(65 + Math.floor(seatNumber / 16))
  const col = (seatNumber % 16) + 1
  return `${row}${col}`
}
