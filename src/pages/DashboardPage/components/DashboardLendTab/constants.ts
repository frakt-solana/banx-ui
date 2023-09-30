export enum AllTimeStatus {
  Repaid = 'totalRepaid',
  Defaulted = 'totalDefaulted',
}

export const ALL_TIME_COLOR_MAP: Record<AllTimeStatus, string> = {
  [AllTimeStatus.Repaid]: 'var(--additional-green-primary)',
  [AllTimeStatus.Defaulted]: 'var(--additional-red-primary)',
}

export const ALL_TIME_DISPLAY_NAMES: Record<AllTimeStatus, string> = {
  [AllTimeStatus.Repaid]: 'Total repaid',
  [AllTimeStatus.Defaulted]: 'Total defaulted',
}

export const EMPTY_SINGLE_BAR_CHART_DATA = {
  key: 'empty',
  label: 'Empty',
  value: 100,
  color: 'var(--bg-secondary)',
}
