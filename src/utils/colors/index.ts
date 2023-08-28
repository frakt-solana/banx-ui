export type ColorBreakpoints = {
  [key: number]: string
}

export const ColorByPercentHealth: ColorBreakpoints = {
  0: '#CC1939',
  22: '#CC5A19',
  33: '#CC8419',
  44: '#CCA519',
  55: '#CCBA19',
  66: '#C9CC19',
  77: '#B3CC19',
  89: '#9ECC19',
  100: '#7DCC19',
}

export const getColorByPercent = (value: number, colorBreakpoints: ColorBreakpoints): string => {
  const limit = Object.keys(colorBreakpoints).find((limit) => value <= parseInt(limit))

  if (limit !== undefined) {
    return colorBreakpoints[parseInt(limit)] || colorBreakpoints[100]
  }

  return colorBreakpoints[100]
}
