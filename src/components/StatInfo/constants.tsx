export enum VALUES_TYPES {
  STRING = 'string',
  PERCENT = 'percent',
}

export const DIMENSION_BY_VALUE_TYPE: Record<VALUES_TYPES, JSX.Element> = {
  [VALUES_TYPES.STRING]: <></>,
  [VALUES_TYPES.PERCENT]: <>%</>,
}
