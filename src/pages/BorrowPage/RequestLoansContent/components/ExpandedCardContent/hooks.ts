import { useCallback, useEffect, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { uniqueId } from 'lodash'
import { useNavigate } from 'react-router-dom'
import { TxnExecutor } from 'solana-transactions-executor'

import { useBanxNotificationsSider } from '@banx/components/BanxNotifications'
import { MAX_APR_VALUE } from '@banx/components/PlaceOfferSection'
import {
  SubscribeNotificationsModal,
  createRequestLoanSubscribeNotificationsContent,
  createRequestLoanSubscribeNotificationsTitle,
} from '@banx/components/modals'

import { BorrowNft, Loan, MarketPreview } from '@banx/api/core'
import { DAYS_IN_YEAR, TXN_EXECUTOR_CONFIRM_OPTIONS } from '@banx/constants'
import { useBorrowNfts } from '@banx/pages/BorrowPage/hooks'
import { PATHS } from '@banx/router'
import {
  createPathWithTokenParam,
  useLoansOptimistic,
  useModal,
  usePriorityFees,
  useTokenType,
} from '@banx/store'
import { createWalletInstance, defaultTxnErrorHandler } from '@banx/transactions'
import { makeListAction } from '@banx/transactions/listing'
import {
  convertToHumanNumber,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  getDecimalPlaces,
  getDialectAccessToken,
  getTokenDecimals,
} from '@banx/utils'

import { useSelectedNfts } from '../../nftsState'
import { DEFAULT_FREEZE_VALUE } from './constants'
import { calculateSummaryInfo, clampInputValue } from './helpers'

export const useRequestLoansForm = (market: MarketPreview) => {
  const { nfts, isLoading: isLoadingNfts, maxLoanValueByMarket } = useBorrowNfts()
  const { selection: selectedNfts, set: setSelection } = useSelectedNfts()
  const { tokenType } = useTokenType()
  const { connected } = useWallet()

  const [inputLoanValue, setInputLoanValue] = useState('')
  const [inputAprValue, setInputAprValue] = useState('')
  const [inputFreezeValue, setInputFreezeValue] = useState('')

  const totalNftsToRequest = selectedNfts.length
  const tokenDecimals = getTokenDecimals(tokenType)

  const filteredNfts = useMemo(() => {
    return nfts.filter((nft) => nft.loan.marketPubkey === market.marketPubkey)
  }, [nfts, market])

  const handleNftsSelection = useCallback(
    (value = 0) => setSelection(filteredNfts.slice(0, value)),
    [filteredNfts, setSelection],
  )

  const handleChangeFreezeValue = (value: string) => {
    const clampedValue = clampInputValue(value, DAYS_IN_YEAR)
    return setInputFreezeValue(clampedValue)
  }

  const handleChangeAprValue = (value: string) => {
    const clampedValue = clampInputValue(value, MAX_APR_VALUE)
    return setInputAprValue(clampedValue)
  }

  useEffect(() => {
    if (!connected) return
    const roundedAprValueInPercent = (market.marketApr / 100)?.toFixed(0)
    setInputAprValue(roundedAprValueInPercent)
    setInputFreezeValue(String(DEFAULT_FREEZE_VALUE))

    const maxLoanValue = maxLoanValueByMarket[market.marketPubkey]
    if (!maxLoanValue) return

    const formattedMaxLoanValue = convertToHumanNumber(maxLoanValue, tokenType)
    const tokenDecimalPlaces = getDecimalPlaces(formattedMaxLoanValue, tokenType)
    const maxLoanValueStr = formattedMaxLoanValue?.toFixed(tokenDecimalPlaces)

    setInputLoanValue(maxLoanValueStr)
  }, [market, maxLoanValueByMarket, tokenType, connected])

  //? Clear selection when marketPubkey changes
  useEffect(() => {
    setSelection([])
  }, [market.marketPubkey, setSelection])

  const inputLoanValueToNumber = parseFloat(inputLoanValue)
  const requestedLoanValue = inputLoanValueToNumber * tokenDecimals

  const requestLoans = useRequestLoansTransaction({
    nfts: selectedNfts,
    aprValue: parseFloat(inputAprValue),
    loanValue: parseFloat(inputLoanValue),
    freezeValue: parseFloat(inputFreezeValue),
  })

  const { ltv, upfrontFee, weeklyInterest } = calculateSummaryInfo({
    requestedLoanValue,
    inputAprValue,
    totalNftsToRequest,
    collectionFloor: market.collectionFloor,
  })

  const disabledListAction =
    !parseFloat(inputLoanValue) ||
    !parseFloat(inputAprValue) ||
    !parseFloat(inputFreezeValue) ||
    !totalNftsToRequest

  return {
    inputLoanValue,
    inputAprValue,
    inputFreezeValue,

    handleChangeLoanValue: setInputLoanValue,
    handleChangeAprValue,
    handleChangeFreezeValue,
    handleNftsSelection,

    requestedLoanValue,
    totalNftsToRequest,

    nfts: filteredNfts,
    isLoadingNfts,

    ltv,
    upfrontFee,
    weeklyInterest,

    tokenType,

    requestLoans,
    disabledListAction,
  }
}

const useRequestLoansTransaction = (props: {
  nfts: BorrowNft[]
  aprValue: number
  loanValue: number
  freezeValue: number
}) => {
  const { nfts, aprValue, loanValue, freezeValue } = props

  const wallet = useWallet()
  const { connection } = useConnection()
  const { priorityLevel } = usePriorityFees()

  const navigate = useNavigate()
  const { setVisibility: setBanxNotificationsSiderVisibility } = useBanxNotificationsSider()
  const { open: openModal, close: closeModal } = useModal()
  const { add: addLoansOptimistic } = useLoansOptimistic()

  const { tokenType } = useTokenType()

  const goToLoansPage = () => {
    navigate(createPathWithTokenParam(PATHS.LOANS, tokenType))
  }

  const onBorrowSuccess = (loansAmount = 1) => {
    //? Show notification with an offer to subscribe (if user not subscribed)
    const isUserSubscribedToNotifications = !!getDialectAccessToken(wallet.publicKey?.toBase58())
    if (!isUserSubscribedToNotifications) {
      openModal(SubscribeNotificationsModal, {
        title: createRequestLoanSubscribeNotificationsTitle(loansAmount),
        message: createRequestLoanSubscribeNotificationsContent(!isUserSubscribedToNotifications),
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

  const requestLoans = async () => {
    const loadingSnackbarId = uniqueId()

    const txnParams = nfts.map((nft) => {
      return {
        nft,
        aprRate: aprValue * 100,
        loanValue,
        freeze: freezeValue,
        tokenType,
        priorityFeeLevel: priorityLevel,
      }
    })

    await new TxnExecutor(
      makeListAction,
      { wallet: createWalletInstance(wallet), connection },
      { confirmOptions: TXN_EXECUTOR_CONFIRM_OPTIONS },
    )
      .addTransactionParams(txnParams)
      .on('sentAll', () => {
        enqueueTransactionsSent()
        enqueueWaitingConfirmation(loadingSnackbarId)
      })
      .on('confirmedAll', (results) => {
        const { confirmed, failed } = results

        destroySnackbar(loadingSnackbarId)

        if (confirmed.length) {
          enqueueSnackbar({ message: 'Listings successfully initialized', type: 'success' })

          const loans = confirmed.map(({ result }) => result).filter(Boolean) as Loan[]

          if (wallet.publicKey) {
            addLoansOptimistic(loans, wallet.publicKey?.toBase58())
          }

          goToLoansPage()
          onBorrowSuccess(loans.length)
        }

        if (failed.length) {
          return failed.forEach(({ signature, reason }) =>
            enqueueConfirmationError(signature, reason),
          )
        }
      })
      .on('error', (error) => {
        destroySnackbar(loadingSnackbarId)
        defaultTxnErrorHandler(error, {
          additionalData: txnParams,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Listing',
        })
      })
      .execute()
  }

  return requestLoans
}
