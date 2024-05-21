import { useMemo } from 'react'

import { chain } from 'lodash'

import { staking } from '@banx/api/common'
import { isAdventureEnded } from '@banx/pages/common/AdventuresPage'

export const useAdventuresAndSubscriptions = (
  banxStakeInfo: staking.BanxInfoBN,
  historyMode = false,
) => {
  const adventuresAndSubscriptions: staking.BanxAdventureAndSubscriptionArray = useMemo(() => {
    if (!banxStakeInfo.banxAdventures.length) return []

    return chain(banxStakeInfo.banxAdventures)
      .map(({ adventure, adventureSubscription }) => ({
        adventure,
        adventureSubscription,
      }))
      .sort(
        ({ adventure: adventureA }, { adventure: adventureB }) => adventureA.week - adventureB.week,
      )
      .thru((adventureAndSubscriptions) =>
        historyMode ? adventureAndSubscriptions.reverse() : adventureAndSubscriptions,
      )
      .filter(({ adventure }) => {
        const isEnded = isAdventureEnded(adventure)
        return historyMode ? isEnded : !isEnded
      })
      .value()
  }, [banxStakeInfo, historyMode])

  return adventuresAndSubscriptions
}
