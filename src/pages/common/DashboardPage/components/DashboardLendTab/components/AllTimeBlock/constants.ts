export enum AllTimeStatus {
  Repaid = 'totalRepaid',
  Defaulted = 'totalDefaulted',
}

export const STATUS_COLOR_MAP: Record<AllTimeStatus, string> = {
  [AllTimeStatus.Repaid]: 'var(--additional-green-primary)',
  [AllTimeStatus.Defaulted]: 'var(--additional-red-primary)',
}

export const STATUS_DISPLAY_NAMES: Record<AllTimeStatus, string> = {
  [AllTimeStatus.Repaid]: 'Total repaid',
  [AllTimeStatus.Defaulted]: 'Total defaulted',
}

export const NO_DATA_CHART_DATA = {
  key: 'empty',
  label: 'Empty',
  value: 100,
  color: 'var(--bg-tertiary)',
}
