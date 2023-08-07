export enum VALUES_TYPES {
  string = 'string',
  percent = 'percent',
  solPrice = 'solPrice',
}

export const DIMENSION_BY_VALUE_TYPE: Record<VALUES_TYPES, JSX.Element> = {
  [VALUES_TYPES.string]: <></>,
  [VALUES_TYPES.percent]: <>%</>,
  [VALUES_TYPES.solPrice]: <>◎</>,
}
