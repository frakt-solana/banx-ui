export const getCssVariableValue = (cssVar: string) => {
  // Remove the 'var(' and ')' from the css variable
  const varName = cssVar.slice(4, -1)

  const colorValue = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  return colorValue
}

export const convertCssVariablesToColors = (cssVariables: string[]) => {
  return cssVariables.map(getCssVariableValue)
}
