export enum NotificationType {
  LOAN = 'loan',
  DEPOSIT = 'deposit',
  LOT_TICKET = 'lotTicket',
  GRACE = 'grace',
}

export interface Notification {
  id: string
  type: NotificationType
  user: string
  message: {
    title: string
    body: string
  }
  image?: string
  isRead: boolean
  date: number
}
