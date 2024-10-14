import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { uniqueId } from 'lodash'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { TxnExecutor } from 'solana-transactions-executor'

import { useBanxNotificationsSider } from '@banx/components/BanxNotifications'
import {
  SubscribeNotificationsModal,
  createLoanListingSubscribeNotificationsContent,
  createLoanListingSubscribeNotificationsTitle,
} from '@banx/components/modals'

import { CollateralToken, TokenLoan } from '@banx/api/tokens'
import { SECONDS_IN_DAY } from '@banx/constants'
import { TokenLoansTabName, useTokenLoansTabs } from '@banx/pages/tokenLending/LoansTokenPage'
import { getDialectAccessToken } from '@banx/providers'
import { PATHS } from '@banx/router'
import { buildUrlWithModeAndToken } from '@banx/store'
import { AssetMode, useModal, useTokenType } from '@banx/store/common'
import { useTokenLoanListingsOptimistic } from '@banx/store/token'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateListTokenTxnDataParams,
  createListTokenTxnData,
  parseListTokenSimulatedAccounts,
} from '@banx/transactions/tokenLending'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueWaitingConfirmation,
  getTokenDecimals,
} from '@banx/utils'

type UseListLoan = (params: {
  collateralToken: CollateralToken | undefined
  collateralAmount: number
  borrowAmount: number
  freezeDuration: number
  apr: number
}) => () => Promise<void>

export const useListLoan: UseListLoan = ({
  collateralToken,
  collateralAmount,
  borrowAmount,
  freezeDuration,
  apr,
}) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const navigate = useNavigate()
  const { tokenType } = useTokenType()

  const { setVisibility: setBanxNotificationsSiderVisibility } = useBanxNotificationsSider()
  const { open: openModal, close: closeModal } = useModal()

  const { add: addLoansOptimistic } = useTokenLoanListingsOptimistic()
  const { setTab: setLoanTab } = useTokenLoansTabs()

  const onBorrowSuccess = (loansAmount = 1) => {
    const isUserSubscribedToNotifications = !!getDialectAccessToken(wallet.publicKey?.toBase58())
    if (!isUserSubscribedToNotifications) {
      openModal(SubscribeNotificationsModal, {
        title: createLoanListingSubscribeNotificationsTitle(loansAmount),
        message: createLoanListingSubscribeNotificationsContent(!isUserSubscribedToNotifications),
        onActionClick: !isUserSubscribedToNotifications
          ? () => {
              closeModal()
              setBanxNotificationsSiderVisibility(true)
            }
          : undefined,
        onCancel: closeModal,
      })
    }
  }

  const goToLoansPage = () => {
    setLoanTab(TokenLoansTabName.LISTINGS)
    navigate(buildUrlWithModeAndToken(PATHS.LOANS, AssetMode.Token, tokenType))
  }

  const listLoan = async () => {
    if (!collateralToken) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const marketTokenDecimals = getTokenDecimals(tokenType)

      const aprRate = apr * 100
      const freezeDurationInSeconds = freezeDuration * SECONDS_IN_DAY

      const txnData = await createListTokenTxnData(
        {
          collateral: collateralToken,
          borrowAmount: borrowAmount * marketTokenDecimals,
          collateralAmount: collateralAmount,
          freezeValue: freezeDurationInSeconds,
          aprRate,
          tokenType,
        },
        walletAndConnection,
      )

      await new TxnExecutor<CreateListTokenTxnDataParams>(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
      })
        .addTxnData(txnData)
        .on('sentSome', (results) => {
          results.forEach(({ signature }) => enqueueTransactionSent(signature))
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          return confirmed.forEach(({ accountInfoByPubkey, signature, params }) => {
            enqueueSnackbar({
              message: 'Loan successfully listed',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            if (accountInfoByPubkey) {
              const accounts = parseListTokenSimulatedAccounts(accountInfoByPubkey)

              const optimisticLoan = createOptimisticLoan({
                newFraktBond: accounts.fraktBond,
                newBondTradeTransaction: accounts.bondTradeTransaction,
                collateral: params.collateral,
              })

              addLoansOptimistic([optimisticLoan], wallet.publicKey!.toBase58())
              goToLoansPage()
              onBorrowSuccess()
            }

            if (failed.length) {
              return failed.forEach(({ signature, reason }) =>
                enqueueConfirmationError(signature, reason),
              )
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
        walletPubkey: wallet.publicKey!.toBase58(),
        transactionName: 'ListTokenLoan',
      })
    }
  }

  return listLoan
}

type CreateOptimisticLoan = (params: {
  collateral: CollateralToken
  newFraktBond: TokenLoan['fraktBond']
  newBondTradeTransaction: TokenLoan['bondTradeTransaction']
}) => TokenLoan

const createOptimisticLoan: CreateOptimisticLoan = ({
  collateral,
  newFraktBond,
  newBondTradeTransaction,
}) => {
  const optimisticLoan = {
    publicKey: newFraktBond.publicKey,
    collateral: collateral.collateral,
    collateralPrice: collateral.collateralPrice,
    bondTradeTransaction: newBondTradeTransaction,
    fraktBond: {
      ...newFraktBond,
      hadoMarket: collateral.marketPubkey,
      lastTransactedAt: moment().unix(), //? Needs to prevent BE data overlap in optimistics logic
    },
  }

  return optimisticLoan
}
