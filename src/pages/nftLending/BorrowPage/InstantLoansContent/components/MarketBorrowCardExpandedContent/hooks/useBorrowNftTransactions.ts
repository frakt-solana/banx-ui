import { WalletContextState, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, sumBy, uniqueId } from 'lodash'
import { useNavigate } from 'react-router-dom'
import { TxnExecutor } from 'solana-transactions-executor'

import { useBanxNotificationsSider } from '@banx/components/BanxNotifications'
import {
  SubscribeNotificationsModal,
  createLoanSubscribeNotificationsContent,
  createLoanSubscribeNotificationsTitle,
} from '@banx/components/modals'

import { UserVaultPrimitive } from '@banx/api'
import { core } from '@banx/api/nft'
import { getDialectAccessToken } from '@banx/providers'
import { PATHS } from '@banx/router'
import { buildUrlWithModeAndToken } from '@banx/store'
import { AssetMode, useIsLedger, useModal, useTokenType } from '@banx/store/common'
import {
  LoansOptimisticStore,
  OffersOptimisticStore,
  useLoansOptimistic,
  useOffersOptimistic,
} from '@banx/store/nft'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateBorrowTxnDataParams,
  createBorrowTxnData,
  parseBorrowSimulatedAccounts,
} from '@banx/transactions/nftLending'
import {
  NftWithLoanValue,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  matchNftsAndOffers,
  offerNeedsReservesOptimizationOnBorrow,
} from '@banx/utils'

import { useBorrowNftsQuery } from './useBorrowNftsQuery'

export const useBorrowNftTransactions = (marketPubkey: string) => {
  const { isLedger } = useIsLedger()
  const { tokenType } = useTokenType()
  const wallet = useWallet()
  const { connection } = useConnection()
  const { add: addLoansOptimistic } = useLoansOptimistic()
  const { update: updateOffersOptimistic } = useOffersOptimistic()
  const { setVisibility: setBanxNotificationsSiderVisibility } = useBanxNotificationsSider()
  const { open, close } = useModal()
  const navigate = useNavigate()
  const { rawOffers, userVaults } = useBorrowNftsQuery(marketPubkey)

  const goToLoansPage = () => {
    navigate(buildUrlWithModeAndToken(PATHS.LOANS, AssetMode.NFT, tokenType))
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

  const borrowSingle = async (nft: NftWithLoanValue) => {
    const createTxnsDataParams = getCreateBorrowTxnsDataParams(
      [nft],
      rawOffers,
      userVaults,
      tokenType,
    )

    await executeBorrow({
      wallet,
      connection,
      createTxnsDataParams,
      addLoansOptimistic,
      updateOffersOptimistic,
      onBorrowSuccess,
      onSuccessAll: () => {
        goToLoansPage()
      },
      isLedger,
    })
  }

  const borrowBulk = async (nfts: NftWithLoanValue[]) => {
    // const selectedNfts = tableNftsData.filter(({ mint }) => !!offerByMint[mint])
    const createTxnsDataParams = getCreateBorrowTxnsDataParams(
      nfts,
      rawOffers,
      userVaults,
      tokenType,
    )

    await executeBorrow({
      wallet,
      connection,
      createTxnsDataParams,
      addLoansOptimistic,
      updateOffersOptimistic,
      onBorrowSuccess,
      onSuccessAll: () => {
        goToLoansPage()
      },
      isLedger,
    })
  }

  return {
    borrowSingle,
    borrowBulk,
  }
}

const getCreateBorrowTxnsDataParams = (
  nfts: NftWithLoanValue[],
  rawOffers: core.Offer[],
  rawUserVaults: UserVaultPrimitive[],
  tokenType: LendingTokenType,
): CreateBorrowTxnDataParams[] => {
  //TODO fix
  const nftWithOffer = matchNftsAndOffers({
    nfts,
    rawOffers,
    rawUserVaults,
  })

  const txnsParams: CreateBorrowTxnDataParams[] = nftWithOffer.map(({ nft, offer }) => ({
    nft: nft.nft,
    loanValue: nft.loanValue,
    offer,
    tokenType,
    optimizeIntoReserves: true,
  }))

  //TODO Do we still need it?
  //? Calc total loanValue for every offer
  const loanValueSumByOffer: Record<string, number> = chain(nftWithOffer)
    .groupBy(({ offer }) => offer.publicKey)
    .entries()
    .map(([offerPubkey, ixnParams]) => [offerPubkey, sumBy(ixnParams, ({ nft }) => nft.loanValue)])
    .fromPairs()
    .value()

  return txnsParams.map(({ offer, ...restParams }) => ({
    ...restParams,
    offer,
    //TODO Do we still need it?
    optimizeIntoReserves: offerNeedsReservesOptimizationOnBorrow(
      offer,
      loanValueSumByOffer[offer.publicKey],
    ),
  }))
}

const executeBorrow = async (props: {
  createTxnsDataParams: CreateBorrowTxnDataParams[]
  isLedger?: boolean
  wallet: WalletContextState
  connection: web3.Connection
  addLoansOptimistic: LoansOptimisticStore['add']
  updateOffersOptimistic: OffersOptimisticStore['update']
  onSuccessAll?: () => void
  onBorrowSuccess?: (loansAmount: number) => void
}) => {
  const {
    isLedger = false,
    createTxnsDataParams,
    wallet,
    connection,
    addLoansOptimistic,
    updateOffersOptimistic,
    onSuccessAll,
    onBorrowSuccess,
  } = props

  const loadingSnackbarId = uniqueId()

  try {
    const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

    const txnsData = await Promise.all(
      createTxnsDataParams.map(({ loanValue, nft, offer, optimizeIntoReserves, tokenType }) =>
        createBorrowTxnData(
          {
            loanValue,
            nft,
            offer,
            optimizeIntoReserves,
            tokenType,
          },
          walletAndConnection,
        ),
      ),
    )

    await new TxnExecutor<CreateBorrowTxnDataParams>(walletAndConnection, {
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

            const loanAndOffer: { loan: core.Loan; offer: core.Offer } = {
              loan: {
                publicKey: fraktBond.publicKey,
                fraktBond: fraktBond,
                bondTradeTransaction: bondTradeTransaction,
                nft: params.nft.nft,
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

          //? Add optimistic offers
          updateOffersOptimistic(
            chain(loanAndOfferArray)
              .compact()
              .map(({ offer }) => offer)
              .value(),
          )

          onSuccessAll?.()
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
      additionalData: createTxnsDataParams,
      walletPubkey: wallet?.publicKey?.toBase58(),
      transactionName: 'Borrow',
    })
  }
}
