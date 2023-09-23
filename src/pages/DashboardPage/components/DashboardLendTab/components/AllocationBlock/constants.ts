export enum AllocationStatus {
  ActiveLoans = 'activeLoans',
  UnderWaterLoans = 'underWaterLoans',
  PendingOffers = 'pendingOffers',
}

export const ALLOCATION_COLOR_MAP: Record<AllocationStatus, string> = {
  [AllocationStatus.ActiveLoans]: 'var(--additional-green-primary)',
  [AllocationStatus.UnderWaterLoans]: 'var(--additional-lava-primary)',
  [AllocationStatus.PendingOffers]: 'var(--additional-blue-primary)',
}
