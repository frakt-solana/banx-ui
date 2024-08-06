import { useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BN } from 'fbonds-core'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Tab, useTabs } from '@banx/components/Tabs'

import {
  calcPartnerPoints,
  useBanxStakeInfo,
  useBanxStakeSettings,
} from '@banx/pages/common/AdventuresPage'
import { useModal } from '@banx/store/common'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  createStakeBanxTokenTxnData,
  createUnstakeBanxTokenTxnData,
  parseAnyStakingSimulatedAccounts,
} from '@banx/transactions/staking'
import {
  ZERO_BN,
  bnToHuman,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmationSingle,
  limitDecimalPlaces,
} from '@banx/utils'

import { calcIdleBalance, calcPlayerPoints, formatBanxTokensStrToBN } from './helpers'

export const useStakeTokensModal = () => {
  const { banxStakeSettings } = useBanxStakeSettings()
  const { banxStakeInfo } = useBanxStakeInfo()

  const { value: currentTabValue, ...tabProps } = useTabs({
    tabs: MODAL_TABS,
    defaultValue: MODAL_TABS[0].value,
  })

  const isStakeTab = currentTabValue === ModalTabs.STAKE

  const tokensPerPartnerPointsBN = banxStakeSettings?.tokensPerPartnerPoints ?? ZERO_BN
  const banxWalletBalanceBN = banxStakeInfo?.banxWalletBalance ?? ZERO_BN
  const banxWalletBalance = bnToHuman(banxWalletBalanceBN)
  const totalTokenStaked = bnToHuman(banxStakeInfo?.banxTokenStake?.tokensStaked ?? ZERO_BN)

  const [inputTokenAmount, setInputTokenAmount] = useState('')

  const handleChangeValue = (inputValue: string) => {
    setInputTokenAmount(limitDecimalPlaces(inputValue))
  }

  const onSetMax = () => {
    if (isStakeTab) {
      return setInputTokenAmount(limitDecimalPlaces(banxWalletBalance.toString()))
    }
    return setInputTokenAmount(limitDecimalPlaces(totalTokenStaked.toString()))
  }

  const onTabClick = () => {
    setInputTokenAmount('')
  }

  const idleBanxWalletBalance = calcIdleBalance(banxWalletBalance, inputTokenAmount)
  const idleStakedTokens = calcIdleBalance(totalTokenStaked, inputTokenAmount)

  const partnerPoints = calcPartnerPoints(
    formatBanxTokensStrToBN(inputTokenAmount),
    tokensPerPartnerPointsBN,
  )
  const playerPoints = calcPlayerPoints(inputTokenAmount)

  const parsedInputTokenAmount = parseFloat(inputTokenAmount) || 0

  const isInsufficientFundsToStake = parsedInputTokenAmount > banxWalletBalance
  const isInsufficientFundsToUnstake = parsedInputTokenAmount > totalTokenStaked

  const isStakeDisabled = !parsedInputTokenAmount || isInsufficientFundsToStake
  const isUnstakeDisabled = !parsedInputTokenAmount || isInsufficientFundsToUnstake

  const showErrorMessage = isStakeTab ? isInsufficientFundsToStake : isInsufficientFundsToUnstake

  return {
    onSetMax,
    handleChangeValue,
    isUnstakeDisabled,
    isStakeDisabled,
    idleStakedTokens,
    banxWalletBalance,
    banxWalletBalanceBN,
    partnerPoints,
    playerPoints,
    idleBanxWalletBalance,
    inputTokenAmount,
    currentTabValue,
    tabProps,
    onTabClick,
    totalTokenStaked,
    showErrorMessage,
    isStakeTab,
  }
}

type UseTokenTransactionsParams = {
  inputTokenAmount: BN
  banxWalletBalance: BN
}
export const useTokenTransactions = ({
  inputTokenAmount,
  banxWalletBalance,
}: UseTokenTransactionsParams) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { close } = useModal()
  const { setOptimistic: setBanxStakeSettingsOptimistic } = useBanxStakeSettings()
  const { setOptimistic: setBanxStakeInfoOptimistic } = useBanxStakeInfo()

  const onStake = async () => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createStakeBanxTokenTxnData(
        { tokensToStake: inputTokenAmount },
        walletAndConnection,
      )

      await new TxnExecutor(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
      })
        .addTxnData(txnData)
        .on('sentAll', (results) => {
          enqueueTransactionsSent()
          enqueueWaitingConfirmationSingle(loadingSnackbarId, results[0].signature)
          close()
        })
        .on('confirmedAll', (results) => {
          destroySnackbar(loadingSnackbarId)

          const { confirmed, failed } = results

          if (confirmed.length) {
            enqueueSnackbar({ message: 'Staked successfully', type: 'success' })

            confirmed.forEach((result) => {
              if (result.accountInfoByPubkey) {
                const { banxStakingSettings, banxTokenStake, banxAdventuresWithSubscription } =
                  parseAnyStakingSimulatedAccounts(result.accountInfoByPubkey)

                setBanxStakeSettingsOptimistic(banxStakingSettings)
                setBanxStakeInfoOptimistic(wallet.publicKey!.toBase58(), {
                  banxWalletBalance: banxWalletBalance.sub(inputTokenAmount),
                  banxAdventuresWithSubscription,
                  banxTokenStake,
                })
              }
            })
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
        additionalData: inputTokenAmount,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'Stake banx token',
      })
    }
  }

  const onUnstake = async () => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createUnstakeBanxTokenTxnData(
        { tokensToUnstake: inputTokenAmount },
        walletAndConnection,
      )

      new TxnExecutor(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
      })
        .addTxnData(txnData)
        .on('sentAll', (results) => {
          enqueueTransactionsSent()
          enqueueWaitingConfirmationSingle(loadingSnackbarId, results[0].signature)
          close()
        })
        .on('confirmedAll', (results) => {
          destroySnackbar(loadingSnackbarId)

          const { confirmed, failed } = results

          if (confirmed.length) {
            enqueueSnackbar({ message: 'Unstaked successfully', type: 'success' })

            confirmed.forEach((result) => {
              if (result.accountInfoByPubkey) {
                const { banxStakingSettings, banxTokenStake, banxAdventuresWithSubscription } =
                  parseAnyStakingSimulatedAccounts(result.accountInfoByPubkey)

                setBanxStakeSettingsOptimistic(banxStakingSettings)
                setBanxStakeInfoOptimistic(wallet.publicKey!.toBase58(), {
                  banxWalletBalance: banxWalletBalance.add(inputTokenAmount),
                  banxAdventuresWithSubscription,
                  banxTokenStake,
                })
              }
            })
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
        additionalData: inputTokenAmount,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'Unstake banx token',
      })
    }
  }

  return {
    onStake,
    onUnstake,
  }
}

export enum ModalTabs {
  STAKE = 'stake',
  UNSTAKE = 'unstake',
}

const MODAL_TABS: Tab[] = [
  {
    label: 'Stake',
    value: ModalTabs.STAKE,
  },
  {
    label: 'Unstake',
    value: ModalTabs.UNSTAKE,
  },
]
