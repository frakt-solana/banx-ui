import { useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { TxnExecutor } from 'solana-transactions-executor'

import { Tab, useTabs } from '@banx/components/Tabs'

import { defaultTxnErrorHandler } from '@banx/transactions'
import { stakeBanxTokenAction, unstakeBanxTokenAction } from '@banx/transactions/staking'
import { ZERO_BN, bnToHuman, enqueueSnackbar, stringToBN, usePriorityFees } from '@banx/utils'

import { calcPartnerPoints } from '../../helpers'
import { useBanxStakeInfo, useBanxStakeSettings } from '../../hooks'
import { calcIdleBalance, calcPlayerPoints, limitDecimalPlaces } from './helpers'

export const useStakeTokensModal = () => {
  const { banxStakeSettings } = useBanxStakeSettings()
  const { banxStakeInfo } = useBanxStakeInfo()

  const { value: currentTabValue, ...tabProps } = useTabs({
    tabs: MODAL_TABS,
    defaultValue: MODAL_TABS[0].value,
  })

  const tokensPerPartnerPointsBN = banxStakeSettings?.tokensPerPartnerPoints ?? ZERO_BN
  const banxWalletBalance = bnToHuman(banxStakeInfo?.banxWalletBalance ?? ZERO_BN)
  const totalTokenStaked = bnToHuman(banxStakeInfo?.banxTokenStake?.tokensStaked ?? ZERO_BN)

  const [inputTokenAmount, setInputTokenAmount] = useState('')

  const handleChangeValue = (inputValue: string) => {
    setInputTokenAmount(limitDecimalPlaces(inputValue))
  }

  const onSetMax = () => {
    if (currentTabValue === ModalTabs.STAKE) {
      return setInputTokenAmount(limitDecimalPlaces(String(banxWalletBalance)))
    }
    return setInputTokenAmount(limitDecimalPlaces(String(totalTokenStaked)))
  }

  const onTabClick = () => {
    setInputTokenAmount('')
  }

  const idleBanxWalletBalance = calcIdleBalance(banxWalletBalance, inputTokenAmount)
  const idleStakedTokens = calcIdleBalance(totalTokenStaked, inputTokenAmount)

  const partnerPoints = calcPartnerPoints(stringToBN(inputTokenAmount), tokensPerPartnerPointsBN)
  const playerPoints = calcPlayerPoints(inputTokenAmount)

  const parsedInputTokenAmount = parseFloat(inputTokenAmount)
  const isStakeDisabled = !parsedInputTokenAmount || banxWalletBalance < parsedInputTokenAmount
  const isUnstakeDisabled = !parsedInputTokenAmount || totalTokenStaked < parsedInputTokenAmount

  return {
    onSetMax,
    handleChangeValue,
    isUnstakeDisabled,
    isStakeDisabled,
    idleStakedTokens,
    banxWalletBalance,
    partnerPoints,
    playerPoints,
    idleBanxWalletBalance,
    inputTokenAmount,
    currentTabValue,
    tabProps,
    onTabClick,
    totalTokenStaked,
  }
}

export const useTokenTransactions = (inputTokenAmount: string) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const priorityFees = usePriorityFees()

  const onStake = () => {
    const txnParam = { tokensToStake: stringToBN(inputTokenAmount), priorityFees }

    new TxnExecutor(stakeBanxTokenAction, { wallet, connection })
      .addTxnParam(txnParam)
      .on('pfSuccessEach', (results) => {
        const { txnHash } = results[0]
        enqueueSnackbar({
          message: 'Transaction sent',
          type: 'info',
          solanaExplorerPath: `tx/${txnHash}`,
        })
      })
      .on('pfSuccessAll', () => {
        close()
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: txnParam,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Stake banx token',
        })
      })
      .execute()
  }

  const onUnstake = () => {
    const txnParam = { tokensToUnstake: stringToBN(inputTokenAmount), priorityFees }

    new TxnExecutor(unstakeBanxTokenAction, { wallet, connection })
      .addTxnParam(txnParam)
      .on('pfSuccessEach', (results) => {
        const { txnHash } = results[0]
        enqueueSnackbar({
          message: 'Transaction sent',
          type: 'info',
          solanaExplorerPath: `tx/${txnHash}`,
        })
      })
      .on('pfSuccessAll', () => {
        close()
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: txnParam,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Unstake banx token',
        })
      })
      .execute()
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
