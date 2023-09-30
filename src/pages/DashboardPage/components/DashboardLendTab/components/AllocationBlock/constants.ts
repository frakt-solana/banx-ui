export enum AllocationStatus {
  ActiveLoans = 'activeLoans',
  UnderWaterLoans = 'underWaterLoans',
  PendingOffers = 'pendingOffers',
}

export const STATUS_COLOR_MAP: Record<AllocationStatus, string> = {
  [AllocationStatus.ActiveLoans]: 'var(--additional-green-primary)',
  [AllocationStatus.UnderWaterLoans]: 'var(--additional-lava-primary)',
  [AllocationStatus.PendingOffers]: 'var(--additional-blue-primary)',
}

export const STATUS_DISPLAY_NAMES: Record<AllocationStatus, string> = {
  [AllocationStatus.ActiveLoans]: 'Active Loans',
  [AllocationStatus.UnderWaterLoans]: 'Underwater Loans',
  [AllocationStatus.PendingOffers]: 'Pending Offers',
}

export const NO_DATA_CHART = {
  value: [100],
  colors: ['var(--bg-secondary)'],
}
