import moment from 'moment'

import {
  Adventure,
  AdventureNft,
  AdventureStatus,
  AdventureSubscription,
  SubscriptionStatus,
} from '@banx/api/adventures'
import { NftType } from '@banx/api/banxTokenStake'

import { START_PERIOD_TIME_ADJUST } from './constants'

export const getAdventureStatus = (adventure: Adventure) => {
  const timeNowUnix = moment().unix()
  const { periodStartedAt, periodEndingAt } = adventure

  if (timeNowUnix > periodEndingAt) return AdventureStatus.ENDED
  if (timeNowUnix > periodStartedAt + START_PERIOD_TIME_ADJUST) return AdventureStatus.LIVE
  return AdventureStatus.UPCOMING
}

export const getSubscriptionStatus = (subscription: AdventureSubscription): SubscriptionStatus => {
  const { unsubscribedAt, harvestedAt } = subscription
  if (unsubscribedAt === 0 && harvestedAt === 0) return SubscriptionStatus.Active
  if (harvestedAt > 0) return SubscriptionStatus.Harvested
  return SubscriptionStatus.Unsubscribed
}

export const isSubscriptionActive = (subscription: AdventureSubscription) =>
  getSubscriptionStatus(subscription) === SubscriptionStatus.Active

export const isNftParticipating = (nft: AdventureNft, adventurePubkey: string) => {
  return !!nft?.subscriptions?.find((subscription) => subscription.adventure === adventurePubkey)
}

export const isNftLoaned = (nft: AdventureNft) => {
  return !!nft?.banxStake?.isLoaned
}

export const calcNftsPartnerPoints = (nfts: NftType[] = []) => {
  return nfts.reduce((acc, { meta }) => acc + Number(meta.partnerPoints), 0)
}
