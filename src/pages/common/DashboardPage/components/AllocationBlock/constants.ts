export enum AllocationStatus {
  Active = 'active',
  Vault = 'vault',
  Underwater = 'underwater',
  Terminating = 'terminating',
}

export const STATUS_COLOR_MAP: Record<AllocationStatus, string> = {
  [AllocationStatus.Vault]: 'var(--additional-blue-primary)',
  [AllocationStatus.Active]: 'var(--additional-green-primary)',
  [AllocationStatus.Underwater]: 'var(--additional-lava-primary)',
  [AllocationStatus.Terminating]: 'var(--additional-red-primary)',
}

export const STATUS_DISPLAY_NAMES: Record<AllocationStatus, string> = {
  [AllocationStatus.Vault]: 'Escrow',
  [AllocationStatus.Active]: 'Active',
  [AllocationStatus.Underwater]: 'Underwater',
  [AllocationStatus.Terminating]: 'Terminating',
}

export const NO_DATA_CHART_DATA = {
  value: [100],
  colors: ['var(--content-tertiary)'],
}
