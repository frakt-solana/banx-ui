import { useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BN } from 'fbonds-core'
import { BanxAdventureSubscriptionState } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { staking } from '@banx/api/common'
import {
  calcPartnerPoints,
  calculateAdventureRewards,
  calculatePlayerPointsForBanxTokens,
  isAdventureEnded,
} from '@banx/pages/common/AdventuresPage'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import { createClaimBanxTxnData } from '@banx/transactions/staking'
import {
  ZERO_BN,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmationSingle,
} from '@banx/utils'

type useAdventuresSidebarProps = {
  banxStakingSettings: staking.BanxStakingSettingsBN
  banxStakeInfo: staking.BanxInfoBN
}
export const useAdventuresSidebar = ({
  banxStakingSettings,
  banxStakeInfo,
}: useAdventuresSidebarProps) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const { banxAdventures, banxTokenStake } = banxStakeInfo

  const walletRewards: BN = useMemo(() => {
    if (!banxAdventures) return ZERO_BN

    const rewardsBN = calculateAdventureRewards(
      banxAdventures //? Claim only from active subscriptions
        .filter(
          ({ adventureSubscription }) =>
            adventureSubscription?.adventureSubscriptionState ===
            BanxAdventureSubscriptionState.Active,
        )
        //? Claim only from ended adventures
        .filter(({ adventure }) => isAdventureEnded(adventure))
        .map(({ adventure, adventureSubscription }) => ({
          adventure,
          subscription: adventureSubscription ?? undefined,
        })),
    )

    return rewardsBN
  }, [banxAdventures])

  const walletRewardsHarvestedTotal: BN = useMemo(() => {
    if (!banxAdventures) return ZERO_BN

    const rewardsBN = calculateAdventureRewards(
      banxAdventures //? Claim only from active subscriptions
        .filter(
          ({ adventureSubscription }) =>
            adventureSubscription?.adventureSubscriptionState ===
            BanxAdventureSubscriptionState.Claimed,
        )
        //? Claim only from ended adventures
        .filter(({ adventure }) => isAdventureEnded(adventure))
        .map(({ adventure, adventureSubscription }) => ({
          adventure,
          subscription: adventureSubscription ?? undefined,
        })),
    )

    return rewardsBN
  }, [banxAdventures])

  const { tokensPerPartnerPoints } = banxStakingSettings

  const tokensPartnerPoints = calcPartnerPoints(
    banxTokenStake?.tokensStaked ?? ZERO_BN,
    tokensPerPartnerPoints,
  )

  const totalPartnerPoints = tokensPartnerPoints + (banxTokenStake?.partnerPointsStaked ?? 0)

  const tokensPlayersPoints = calculatePlayerPointsForBanxTokens(
    banxTokenStake?.tokensStaked ?? ZERO_BN,
  )
  const totalPlayersPoints = (banxTokenStake?.playerPointsStaked ?? 0) + tokensPlayersPoints

  const claimBanx = async () => {
    if (!wallet.publicKey?.toBase58() || !banxTokenStake) {
      return
    }

    const loadingSnackbarId = uniqueId()

    const weeks = chain(banxAdventures)
      //? Claim only from active subscriptions
      .filter(
        ({ adventureSubscription }) =>
          adventureSubscription?.adventureSubscriptionState ===
          BanxAdventureSubscriptionState.Active,
      )
      //? Claim only from ended adventures
      .filter(({ adventure }) => isAdventureEnded(adventure))
      .map(({ adventure }) => adventure.week)
      .value()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createClaimBanxTxnData({
        weeks,
        walletAndConnection,
      })

      await new TxnExecutor(walletAndConnection, TXN_EXECUTOR_DEFAULT_OPTIONS)
        .addTxnData(txnData)
        .on('sentAll', (results) => {
          enqueueTransactionsSent()
          enqueueWaitingConfirmationSingle(loadingSnackbarId, results[0].signature)
        })
        .on('confirmedAll', (results) => {
          destroySnackbar(loadingSnackbarId)

          const { confirmed, failed } = results

          if (confirmed.length) {
            enqueueSnackbar({ message: 'Claimed successfully', type: 'success' })
          }

          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: weeks,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'Claim StakeBanx',
      })
    }
  }

  return {
    claimBanx,
    totalPartnerPoints,
    totalPlayersPoints,
    walletRewards,
    walletRewardsHarvestedTotal,
  }
}
