export enum AllTimeStatus {
  Repaid = 'totalRepaid',
  Interest = 'totalInterestEarned',
}

export const ALL_TIME_COLOR_MAP: Record<AllTimeStatus, string> = {
  [AllTimeStatus.Repaid]: 'var(--additional-green-primary)',
  [AllTimeStatus.Interest]: 'var(--additional-red-primary)',
}

export const ALL_TIME_DISPLAY_NAMES: Record<AllTimeStatus, string> = {
  [AllTimeStatus.Repaid]: 'Total repaid',
  [AllTimeStatus.Interest]: 'Total defaulted',
}
