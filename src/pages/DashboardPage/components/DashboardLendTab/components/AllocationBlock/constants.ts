export enum AllocationStatus {
  ActiveLoans = 'Active loans',
  UnderWaterLoans = 'Under water loans',
  PendingOffers = 'Pending offers',
}

export const ALLOCATION_COLOR_MAP: Record<AllocationStatus, string> = {
  [AllocationStatus.ActiveLoans]: 'var(--additional-green-primary)',
  [AllocationStatus.UnderWaterLoans]: 'var(--additional-lava-primary)',
  [AllocationStatus.PendingOffers]: 'var(--additional-blue-primary)',
}
