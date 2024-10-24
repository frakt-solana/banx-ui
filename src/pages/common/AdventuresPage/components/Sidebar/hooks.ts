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
  useBanxStakeInfo,
  useBanxStakeSettings,
} from '@banx/pages/common/AdventuresPage'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  createClaimBanxTxnData,
  parseAnyStakingSimulatedAccounts,
} from '@banx/transactions/staking'
import {
  ZERO_BN,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmationSingle,
} from '@banx/utils'

import { convertStakingSimulatedAccountsToMergeData } from '../../optimistics'

type UseAdventuresSidebarProps = {
  banxStakingSettings: staking.BanxStakingSettings
  banxStakeInfo: staking.BanxStakingInfo
}
export const useAdventuresSidebar = ({
  banxStakingSettings,
  banxStakeInfo,
}: UseAdventuresSidebarProps) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { setOptimistic: setBanxStakeSettingsOptimistic } = useBanxStakeSettings()
  const { setOptimistic: setBanxStakeInfoOptimistic } = useBanxStakeInfo()

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

  const totalPartnerPoints =
    tokensPartnerPoints + (banxTokenStake?.partnerPointsStaked.toNumber() ?? 0)

  const tokensPlayersPoints = calculatePlayerPointsForBanxTokens(
    banxTokenStake?.tokensStaked ?? ZERO_BN,
  )
  const totalPlayersPoints =
    (banxTokenStake?.playerPointsStaked.toNumber() ?? 0) + tokensPlayersPoints

  const MAX_WEEKS_PER_TXN = 8
  const claimBanx = async () => {
    if (!wallet.publicKey?.toBase58() || !banxTokenStake) {
      return
    }

    const loadingSnackbarId = uniqueId()

    const chunkWeeks = chain(banxAdventures)
      //? Claim only from active subscriptions
      .filter(
        ({ adventureSubscription }) =>
          adventureSubscription?.adventureSubscriptionState ===
          BanxAdventureSubscriptionState.Active,
      )
      //? Claim only from ended adventures
      .filter(({ adventure }) => isAdventureEnded(adventure))
      .map(({ adventure }) => adventure.week)
      .chunk(MAX_WEEKS_PER_TXN)
      .value()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        chunkWeeks.map((weeks) => createClaimBanxTxnData({ weeks }, walletAndConnection)),
      )

      await new TxnExecutor(walletAndConnection, TXN_EXECUTOR_DEFAULT_OPTIONS)
        .addTxnsData(txnsData)
        .on('sentAll', (results) => {
          enqueueTransactionsSent()
          enqueueWaitingConfirmationSingle(loadingSnackbarId, results[0].signature)

          // //! ==============================================================================
          // // For optimistics debug
          // const optimisticParams = chain(results)
          //   .map(({ accountInfoByPubkey }) => {
          //     if (!accountInfoByPubkey) return null
          //     return parseAnyStakingSimulatedAccounts(accountInfoByPubkey)
          //   })
          //   .compact()
          //   .thru(convertStakingSimulatedAccountsToMergeData)
          //   .value()

          // setBanxStakeSettingsOptimistic(optimisticParams.banxStakingSettings)
          // setBanxStakeInfoOptimistic(wallet.publicKey!.toBase58(), optimisticParams)
          // //! ==============================================================================
        })
        .on('confirmedAll', (results) => {
          destroySnackbar(loadingSnackbarId)

          const { confirmed, failed } = results

          if (confirmed.length) {
            enqueueSnackbar({ message: 'Claimed successfully', type: 'success' })

            const optimisticParams = chain(confirmed)
              .map(({ accountInfoByPubkey }) => {
                if (!accountInfoByPubkey) return null
                return parseAnyStakingSimulatedAccounts(accountInfoByPubkey)
              })
              .compact()
              .thru(convertStakingSimulatedAccountsToMergeData)
              .value()

            setBanxStakeSettingsOptimistic(optimisticParams.banxStakingSettings)
            setBanxStakeInfoOptimistic(wallet.publicKey!.toBase58(), optimisticParams)
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
        additionalData: chunkWeeks,
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
