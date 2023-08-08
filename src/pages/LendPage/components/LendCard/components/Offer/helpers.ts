const MAX_PERCENTAGE = 36
const OFFSET_PX = 110
const OFFSET_LINE_PX = 4

const calculatePosition = (value = 0, offset = 0) => {
  const isWithinMaxPercentage = value <= MAX_PERCENTAGE
  if (isWithinMaxPercentage) {
    return `${value}%`
  }

  const calculatedPosition = `calc(${value}% - ${offset}px)`
  return calculatedPosition
}

export const calculateLineLeftPosition = (value = 0) => {
  return calculatePosition(value, OFFSET_LINE_PX)
}

export const calculateLeftPosition = (value = 0) => {
  return calculatePosition(value, OFFSET_PX)
}
