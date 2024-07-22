import { useMemo, useState } from 'react'

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
import { BorrowSplTokenOffers, CollateralToken, core } from '@banx/api/tokens'
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
import { parseBorrowSimulatedAccounts } from '@banx/transactions/nftLending'
import {
  CreateBorrowTokenTxnDataParams,
  createBorrowSplTokenTxnData,
} from '@banx/transactions/tokenLending'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
} from '@banx/utils'

import { BorrowToken } from '../../constants'
import { calculateTokenBorrowApr } from '../helpers'

type TransactionData = {
  offer: Offer
  loanValue: number
  collateral: CollateralToken
  aprRate: number
}

export const useBorrowSplTokenTransaction = (props: {
  collateral: CollateralToken | undefined
  borrowToken: BorrowToken | undefined
  splTokenOffers: BorrowSplTokenOffers[]
}) => {
  const { collateral, borrowToken, splTokenOffers } = props

  const wallet = useWallet()
  const { connection } = useConnection()
  const navigate = useNavigate()
  const { open, close } = useModal()

  const { isLedger } = useIsLedger()
  const { tokenType } = useNftTokenType()

  const [isBorrowing, setIsBorrowing] = useState(false)

  const { add: addLoansOptimistic } = useTokenLoansOptimistic()

  const { offers, updateOrAddOffer } = useTokenMarketOffers(collateral?.marketPubkey || '')

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

      if (!collateral || !borrowToken) return acc

      const aprRate = calculateTokenBorrowApr({
        offer,
        collateralToken: collateral,
        borrowToken,
      })

      if (offerData) {
        acc.push({
          offer: offerData,
          loanValue: loanValueToNumber,
          collateral,
          aprRate,
        })
      }

      return acc
    }, [])
  }, [borrowToken, collateral, offers, splTokenOffers])

  const borrow = async () => {
    const loadingSnackbarId = uniqueId()

    if (!transactionsData.length) return

    try {
      setIsBorrowing(true)

      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        transactionsData.map(({ collateral, aprRate, loanValue, offer }) =>
          createBorrowSplTokenTxnData(
            {
              loanValue,
              collateral,
              offer,
              aprRate,
              tokenType,
            },
            walletAndConnection,
          ),
        ),
      )

      await new TxnExecutor<CreateBorrowTokenTxnDataParams>(walletAndConnection, {
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

            const loanAndOfferArray = confirmed.map((txnResult) => {
              const { accountInfoByPubkey, params } = txnResult

              if (!accountInfoByPubkey) return

              const { bondOffer, bondTradeTransaction, fraktBond } =
                parseBorrowSimulatedAccounts(accountInfoByPubkey)

              const loanAndOffer: { loan: core.TokenLoan; offer: Offer } = {
                loan: {
                  publicKey: fraktBond.publicKey,
                  fraktBond: fraktBond,
                  bondTradeTransaction: bondTradeTransaction,
                  collateral: params.collateral.collateral,
                  collateralPrice: params.collateral.collateralPrice,
                },
                offer: bondOffer,
              }

              return loanAndOffer
            })

            //? Add optimistic loans
            if (wallet.publicKey) {
              addLoansOptimistic(
                chain(loanAndOfferArray)
                  .compact()
                  .map(({ loan }) => loan)
                  .value(),
                wallet.publicKey.toBase58(),
              )
            }

            loanAndOfferArray.forEach((loanAndOffer) => {
              if (loanAndOffer) {
                updateOrAddOffer(loanAndOffer.offer)
              }
            })

            goToLoansPage()
            onBorrowSuccess?.(loanAndOfferArray.length)
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
    } finally {
      setIsBorrowing(false)
    }
  }

  return { borrow, isBorrowing }
}
