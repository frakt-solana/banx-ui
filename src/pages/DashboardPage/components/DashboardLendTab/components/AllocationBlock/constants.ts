export enum AllocationStatus {
  Active = 'active',
  Pending = 'pending',
  Underwater = 'underwater',
  Terminating = 'terminating',
}

export const STATUS_COLOR_MAP: Record<AllocationStatus, string> = {
  [AllocationStatus.Pending]: 'var(--additional-blue-primary)',
  [AllocationStatus.Active]: 'var(--additional-green-primary)',
  [AllocationStatus.Underwater]: 'var(--additional-orange-primary)',
  [AllocationStatus.Terminating]: 'var(--additional-lava-primary)',
}

export const STATUS_DISPLAY_NAMES: Record<AllocationStatus, string> = {
  [AllocationStatus.Active]: 'Active healthy',
  [AllocationStatus.Pending]: 'Pending',
  [AllocationStatus.Underwater]: 'Active underwater',
  [AllocationStatus.Terminating]: 'Terminating',
}

export const NO_DATA_CHART_DATA = {
  value: [100],
  colors: ['var(--bg-secondary)'],
}
