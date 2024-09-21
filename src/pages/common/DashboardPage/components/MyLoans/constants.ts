export enum LoansStatus {
  Active = 'activeLoans',
  Terminating = 'terminating',
  Liquidation = 'liquidation',
}

export const STATUS_COLOR_MAP: Record<LoansStatus, string> = {
  [LoansStatus.Active]: 'var(--additional-green-primary)',
  [LoansStatus.Terminating]: 'var(--additional-lava-primary)',
  [LoansStatus.Liquidation]: 'var(--additional-red-primary)',
}

export const STATUS_DISPLAY_NAMES: Record<LoansStatus, string> = {
  [LoansStatus.Active]: 'Active Loans',
  [LoansStatus.Terminating]: 'Terminating Loans',
  [LoansStatus.Liquidation]: 'Liquidating within 24h',
}

export const NO_DATA_CHART_DATA = {
  value: [100],
  colors: ['var(--content-tertiary)'],
}
