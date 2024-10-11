import { useEffect, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BN } from 'fbonds-core'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { useWalletBalance } from '@banx/hooks'
import { useTokenType } from '@banx/store/common'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateUpdateUserVaultTxnDataParams,
  createUpdateUserVaultTxnData,
  parseDepositSimulatedAccounts,
} from '@banx/transactions/vault'
import {
  ZERO_BN,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  getTokenDecimals,
  stringToBN,
} from '@banx/utils'

import { getInputErrorMessage } from '../helpers'
import { useLenderVaultInfo } from './useUserVault'

export enum TabName {
  Wallet = 'wallet',
  Escrow = 'escrow',
}

export const useUserVaultContent = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { tokenType } = useTokenType()

  const { lenderVaultInfo, updateUserVaultOptimistic } = useLenderVaultInfo()
  const walletBalance = useWalletBalance(tokenType)
  const escrowBalance = lenderVaultInfo.offerLiquidityAmount

  const [activeTab, setActiveTab] = useState<TabName>(TabName.Wallet)
  const [inputValue, setInputValue] = useState('0')

  const tokenDecimals = getTokenDecimals(tokenType)

  const formatBalance = (balance: number) => (balance / tokenDecimals).toString()

  useEffect(() => {
    setInputValue(formatBalance(walletBalance))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onTabClick = (nextTab: TabName) => {
    setActiveTab(nextTab)

    const balance = nextTab === TabName.Wallet ? walletBalance : escrowBalance

    setInputValue(formatBalance(balance))
  }

  const update = async (amount: BN) => {
    if (amount.lt(ZERO_BN)) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createUpdateUserVaultTxnData(
        {
          amount,
          lendingTokenType: tokenType,
          add: activeTab === TabName.Wallet,
        },
        walletAndConnection,
      )

      await new TxnExecutor<CreateUpdateUserVaultTxnDataParams>(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
      })
        .addTxnData(txnData)
        .on('sentAll', () => {
          enqueueTransactionsSent()
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (confirmed.length) {
            enqueueSnackbar({
              message:
                activeTab === TabName.Wallet ? 'Successfully deposited' : 'Successfully withdrawn',
              type: 'success',
            })

            confirmed.forEach(({ accountInfoByPubkey }) => {
              if (!accountInfoByPubkey) return
              const userVault = parseDepositSimulatedAccounts(accountInfoByPubkey)

              updateUserVaultOptimistic({
                walletPubkey: walletAndConnection.wallet.publicKey.toBase58(),
                updatedUserVault: userVault,
              })
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
        additionalData: {
          amount: inputValue,
          lendingTokenType: tokenType,
        },
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'UpdateUserVault',
      })
    }
  }

  const onActionClick = () => {
    update(stringToBN(inputValue, Math.log10(tokenDecimals)))
  }

  const errorMessage = getInputErrorMessage({
    activeTab,
    walletBalance,
    escrowBalance,
    inputValue,
    tokenType,
  })

  return {
    inputValue,
    setInputValue,

    activeTab,
    onTabClick,

    onActionClick,

    walletBalance,
    escrowBalance,

    errorMessage,
    tokenType,
  }
}
