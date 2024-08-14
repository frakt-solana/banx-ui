import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BN } from 'fbonds-core'
import { BondFeatures, BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'
import { uniqueId } from 'lodash'
import moment from 'moment'
import { TxnExecutor } from 'solana-transactions-executor'

import { Offer } from '@banx/api/nft'
import { TokenMarketPreview } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateMakeBondingOfferTxnDataParams,
  CreateRemoveOfferTxnDataParams,
  CreateUpdateBondingOfferTxnDataParams,
  createMakeBondingOfferTxnData,
  createRemoveOfferTxnData,
  createUpdateBondingOfferTxnData,
  parseMakeTokenOfferSimulatedAccounts,
  parseRemoveTokenOfferSimulatedAccounts,
  parseUpdateTokenOfferSimulatedAccounts,
} from '@banx/transactions/nftLending'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueWaitingConfirmation,
} from '@banx/utils'

import { calculateTokenLendingApr } from '../helpers'

export const useTokenOfferTransactions = ({
  marketPubkey,
  loanValue,
  optimisticOffer,
  updateOrAddOffer,
  resetFormValues,
  collateralsPerToken,
  market,
}: {
  marketPubkey: string
  loanValue: number
  optimisticOffer?: Offer
  updateOrAddOffer: (offer: BondOfferV3) => void
  resetFormValues: () => void
  collateralsPerToken: BN
  market: TokenMarketPreview | undefined
}) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { tokenType } = useNftTokenType()

  const onCreateTokenOffer = async () => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const lendingTokenAprRate = calculateTokenLendingApr(market, collateralsPerToken)

      const txnData = await createMakeBondingOfferTxnData(
        {
          marketPubkey,
          loansAmount: 1,
          loanValue,
          deltaValue: 0,
          collateralsPerToken,
          tokenLendingApr: lendingTokenAprRate,
          bondFeature: BondFeatures.AutoReceiveAndReceiveSpl,
          tokenType,
        },
        walletAndConnection,
      )

      await new TxnExecutor<CreateMakeBondingOfferTxnDataParams>(
        walletAndConnection,
        TXN_EXECUTOR_DEFAULT_OPTIONS,
      )
        .addTxnData(txnData)
        .on('sentSome', (results) => {
          results.forEach(({ signature }) => enqueueTransactionSent(signature))
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }

          return confirmed.forEach(({ accountInfoByPubkey, signature }) => {
            enqueueSnackbar({
              message: 'Offer successfully placed',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            if (accountInfoByPubkey) {
              const offer = parseMakeTokenOfferSimulatedAccounts(accountInfoByPubkey)
              updateOrAddOffer(offer)
              resetFormValues()
            }
          })
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: {
          marketPubkey,
          loanValue,
          tokenType,
        },
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'CreateTokenOffer',
      })
    }
  }

  const onUpdateTokenOffer = async () => {
    if (!optimisticOffer) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const lendingTokenAprRate = calculateTokenLendingApr(market, collateralsPerToken)

      const txnData = await createUpdateBondingOfferTxnData(
        {
          loanValue,
          offer: optimisticOffer,
          loansAmount: 1,
          deltaValue: 0,
          tokenType,
          collateralsPerToken,
          tokenLendingApr: lendingTokenAprRate,
        },
        walletAndConnection,
      )

      await new TxnExecutor<CreateUpdateBondingOfferTxnDataParams>(
        walletAndConnection,
        TXN_EXECUTOR_DEFAULT_OPTIONS,
      )
        .addTxnData(txnData)
        .on('sentSome', (results) => {
          results.forEach(({ signature }) => enqueueTransactionSent(signature))
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }

          return confirmed.forEach(({ accountInfoByPubkey, signature }) => {
            enqueueSnackbar({
              message: 'Changes successfully applied',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })
            if (accountInfoByPubkey) {
              if (accountInfoByPubkey) {
                const offer = parseUpdateTokenOfferSimulatedAccounts(accountInfoByPubkey)
                //? Needs to prevent BE data overlap in optimistics logic
                updateOrAddOffer({ ...offer, lastTransactedAt: new BN(moment().unix()) })
              }
            }
          })
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: {
          loanValue,
          offer: optimisticOffer,
          tokenType,
        },
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'UpdateTokenOffer',
      })
    }
  }

  const onRemoveTokenOffer = async () => {
    if (!optimisticOffer) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createRemoveOfferTxnData(
        { offer: optimisticOffer, tokenType },
        walletAndConnection,
      )

      await new TxnExecutor<CreateRemoveOfferTxnDataParams>(
        walletAndConnection,
        TXN_EXECUTOR_DEFAULT_OPTIONS,
      )
        .addTxnData(txnData)
        .on('sentSome', (results) => {
          results.forEach(({ signature }) => enqueueTransactionSent(signature))
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }

          return confirmed.forEach(({ accountInfoByPubkey, signature }) => {
            enqueueSnackbar({
              message: 'Offer successfully removed',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            if (accountInfoByPubkey) {
              const offer = parseRemoveTokenOfferSimulatedAccounts(accountInfoByPubkey)
              //? Needs to prevent BE data overlap in optimistics logic
              updateOrAddOffer({ ...offer, lastTransactedAt: new BN(moment().unix()) })
            }
          })
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: { offer: optimisticOffer, tokenType },
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'RemoveTokenOffer',
      })
    }
  }

  return {
    onCreateTokenOffer,
    onUpdateTokenOffer,
    onRemoveTokenOffer,
  }
}
