export enum VALUES_TYPES {
  STRING = 'string',
  PERCENT = 'percent',
  SOLPRICE = 'solPrice',
}

export const DIMENSION_BY_VALUE_TYPE: Record<VALUES_TYPES, JSX.Element> = {
  [VALUES_TYPES.STRING]: <></>,
  [VALUES_TYPES.PERCENT]: <>%</>,
  [VALUES_TYPES.SOLPRICE]: <>◎</>,
}
