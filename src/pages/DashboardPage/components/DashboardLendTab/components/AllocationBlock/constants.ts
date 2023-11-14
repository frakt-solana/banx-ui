export enum AllocationStatus {
  Active = 'active',
  Pending = 'pending',
  Underwater = 'underwater',
  Terminating = 'terminating',
}

export const STATUS_COLOR_MAP: Record<AllocationStatus, string> = {
  [AllocationStatus.Active]: 'var(--additional-green-primary)',
  [AllocationStatus.Pending]: 'var(--additional-blue-primary)',
  [AllocationStatus.Underwater]: 'var(--additional-orange-primary)',
  [AllocationStatus.Terminating]: 'var(--additional-lava-primary)',
}

export const STATUS_DISPLAY_NAMES: Record<AllocationStatus, string> = {
  [AllocationStatus.Active]: 'Active',
  [AllocationStatus.Pending]: 'Pending',
  [AllocationStatus.Underwater]: 'Underwater',
  [AllocationStatus.Terminating]: 'Terminating',
}

export const NO_DATA_CHART_DATA = {
  value: [100],
  colors: ['var(--bg-secondary)'],
}
