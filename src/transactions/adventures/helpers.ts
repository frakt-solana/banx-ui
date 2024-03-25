import { AdventureSubscription, SubscriptionStatus } from '@banx/api/adventures'

export const getSubscriptionStatus = (subscription: AdventureSubscription): SubscriptionStatus => {
  const { unsubscribedAt, harvestedAt } = subscription
  if (unsubscribedAt === 0 && harvestedAt === 0) return SubscriptionStatus.Active
  if (harvestedAt > 0) return SubscriptionStatus.Harvested
  return SubscriptionStatus.Unsubscribed
}

export const isSubscriptionActive = (subscription: AdventureSubscription) =>
  getSubscriptionStatus(subscription) === SubscriptionStatus.Active
