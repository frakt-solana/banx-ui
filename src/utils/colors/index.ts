export type ColorBreakpoints = {
  [key: number]: string
}

export const HealthColorDecreasing: ColorBreakpoints = {
  0: '#CF1322',
  15: '#D4380D',
  30: '#D46B08',
  45: '#D48806',
  60: '#D4B106',
  75: '#7CB305',
  90: '#389E0D',
  100: '#389E0D',
}

export const HealthColorIncreasing: ColorBreakpoints = {
  0: '#389E0D',
  15: '#389E0D',
  45: '#7CB305',
  50: '#D4B106',
  60: '#D48806',
  75: '#D46B08',
  90: '#D4380D',
  100: '#CF1322',
}

export const getColorByPercent = (value: number, colorBreakpoints: ColorBreakpoints): string => {
  const limit = Object.keys(colorBreakpoints).find((limit) => value <= parseInt(limit))

  if (limit !== undefined) {
    return colorBreakpoints[parseInt(limit)] || colorBreakpoints[100]
  }

  return colorBreakpoints[100]
}
