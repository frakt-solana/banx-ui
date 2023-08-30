export type ColorBreakpoints = {
  [key: number]: string
}

export const ColorByPercentHealth: ColorBreakpoints = {
  0: '#CF1322',
  15: '#D4380D',
  30: '#D46B08',
  45: '#D48806',
  60: '#D4B106',
  75: '#7CB305',
  90: '#389E0D',
  100: '#389E0D',
}

export const getColorByPercent = (value: number, colorBreakpoints: ColorBreakpoints): string => {
  const limit = Object.keys(colorBreakpoints).find((limit) => value <= parseInt(limit))

  if (limit !== undefined) {
    return colorBreakpoints[parseInt(limit)] || colorBreakpoints[100]
  }

  return colorBreakpoints[100]
}
