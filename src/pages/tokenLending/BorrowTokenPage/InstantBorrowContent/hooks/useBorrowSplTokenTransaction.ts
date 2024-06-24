import { useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BN } from 'fbonds-core'
import { chain, find, uniqueId } from 'lodash'
import { useNavigate } from 'react-router-dom'
import { TxnExecutor } from 'solana-transactions-executor'

import { useBanxNotificationsSider } from '@banx/components/BanxNotifications'
import {
  SubscribeNotificationsModal,
  createLoanSubscribeNotificationsContent,
  createLoanSubscribeNotificationsTitle,
} from '@banx/components/modals'

import { Offer } from '@banx/api/nft'
import { BorrowSplTokenOffers } from '@banx/api/tokens'
import { useTokenMarketOffers } from '@banx/pages/tokenLending/LendTokenPage'
import { getDialectAccessToken } from '@banx/providers'
import { PATHS } from '@banx/router'
import { createPathWithModeParams } from '@banx/store'
import { ModeType, useIsLedger, useModal } from '@banx/store/common'
import { useNftTokenType } from '@banx/store/nft'
import { useTokenLoansOptimistic } from '@banx/store/token'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  BorrowTokenTxnOptimisticResult,
  createBorrowSplTokenTxnData,
} from '@banx/transactions/tokenLending'
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
  const navigate = useNavigate()
  const { open, close } = useModal()

  const { isLedger } = useIsLedger()
  const { tokenType } = useNftTokenType()

  const { add: addLoansOptimistic } = useTokenLoansOptimistic()

  const { offers, updateOrAddOffer } = useTokenMarketOffers(token.marketPubkey || '')

  const { setVisibility: setBanxNotificationsSiderVisibility } = useBanxNotificationsSider()

  const goToLoansPage = () => {
    navigate(createPathWithModeParams(PATHS.LOANS_TOKEN, ModeType.Token, tokenType))
  }

  const onBorrowSuccess = (loansAmount = 1) => {
    //? Show notification with an offer to subscribe (if user not subscribed)
    const isUserSubscribedToNotifications = !!getDialectAccessToken(wallet.publicKey?.toBase58())
    if (!isUserSubscribedToNotifications) {
      open(SubscribeNotificationsModal, {
        title: createLoanSubscribeNotificationsTitle(loansAmount),
        message: createLoanSubscribeNotificationsContent(!isUserSubscribedToNotifications),
        onActionClick: !isUserSubscribedToNotifications
          ? () => {
              close()
              setBanxNotificationsSiderVisibility(true)
            }
          : undefined,
        onCancel: close,
      })
    }
  }

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

      await new TxnExecutor<BorrowTokenTxnOptimisticResult>(walletAndConnection, {
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

            const loans = chain(confirmed)
              .map(({ result }) => result?.loan)
              .compact()
              .value()

            if (wallet.publicKey) {
              addLoansOptimistic(loans, wallet.publicKey?.toBase58())
            }

            confirmed.forEach(({ result }) => {
              if (result) {
                updateOrAddOffer(result?.offer)
              }
            })

            goToLoansPage()
            onBorrowSuccess?.(loans.length)
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
