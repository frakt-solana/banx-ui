export enum LoansStatus {
  Active = 'activeLoans',
  Terminating = 'terminating',
  Liquidation = 'liquidation',
}

export const LOANS_COLOR_MAP: Record<LoansStatus, string> = {
  [LoansStatus.Active]: 'var(--additional-green-primary)',
  [LoansStatus.Terminating]: 'var(--additional-lava-primary)',
  [LoansStatus.Liquidation]: 'var(--additional-red-primary)',
}

export const LOANS_DISPLAY_NAMES: Record<LoansStatus, string> = {
  [LoansStatus.Active]: 'Active Loans',
  [LoansStatus.Terminating]: 'Terminating Loans',
  [LoansStatus.Liquidation]: 'Liquidation during 24h',
}
