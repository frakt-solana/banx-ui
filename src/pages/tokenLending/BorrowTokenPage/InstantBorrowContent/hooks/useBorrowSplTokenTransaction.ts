import { useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BN } from 'fbonds-core'
import { find, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Offer } from '@banx/api/nft'
import { BorrowSplTokenOffers } from '@banx/api/tokens'
import { useTokenMarketOffers } from '@banx/pages/tokenLending/LendTokenPage'
import { useIsLedger } from '@banx/store/common'
import { useNftTokenType } from '@banx/store/nft'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import { createBorrowSplTokenTxnData } from '@banx/transactions/tokenLending'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
} from '@banx/utils'

import { BorrowToken, MOCK_APR_RATE } from '../../constants'

type TransactionData = {
  offer: Offer
  loanValue: number
  token: BorrowToken
}

export const useBorrowSplTokenTransaction = (
  token: BorrowToken,
  splTokenOffers: BorrowSplTokenOffers[],
) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { isLedger } = useIsLedger()
  const { tokenType } = useNftTokenType()

  const { offers } = useTokenMarketOffers(token.marketPubkey || '')

  const transactionsData = useMemo(() => {
    if (!offers.length) return []

    return splTokenOffers.reduce<TransactionData[]>((acc, offer) => {
      const offerData = find(offers, ({ publicKey }) => publicKey === offer.offerPublicKey)
      const loanValueToNumber = new BN(offer.amountToGet, 'hex').toNumber()

      if (offerData) {
        acc.push({
          offer: offerData,
          loanValue: loanValueToNumber,
          token,
        })
      }

      return acc
    }, [])
  }, [token, offers, splTokenOffers])

  const executeBorrow = async () => {
    const loadingSnackbarId = uniqueId()

    if (!transactionsData.length) return

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        transactionsData.map(({ token, loanValue, offer }) =>
          createBorrowSplTokenTxnData({
            loanValue,
            collateral: token,
            offer,
            optimizeIntoReserves: true,
            aprRate: MOCK_APR_RATE, //TODO (TokenLending): Need to calc in the future
            tokenType,
            walletAndConnection,
          }),
        ),
      )

      await new TxnExecutor(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
        chunkSize: isLedger ? 1 : 40,
      })
        .addTxnsData(txnsData)
        .on('sentSome', () => {
          enqueueTransactionsSent()
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (confirmed.length) {
            enqueueSnackbar({ message: 'Borrowed successfully', type: 'success' })
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
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'BorrowSplToken',
      })
    }
  }

  return { executeBorrow }
}
