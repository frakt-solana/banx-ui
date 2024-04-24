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

import { BorrowNft, MarketPreview } from '@banx/api/core'
import { DAYS_IN_YEAR, TXN_EXECUTOR_CONFIRM_OPTIONS } from '@banx/constants'
import { useBorrowNfts } from '@banx/pages/BorrowPage/hooks'
import { PATHS } from '@banx/router'
import { createPathWithTokenParam, useModal, usePriorityFees, useTokenType } from '@banx/store'
import { createWalletInstance, defaultTxnErrorHandler } from '@banx/transactions'
import { makeListAction } from '@banx/transactions/listing'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  formatValueByTokenType,
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
    const maxLoanValue = maxLoanValueByMarket[market.marketPubkey]
    if (!maxLoanValue) return

    const formattedMaxLoanValue = formatValueByTokenType(maxLoanValue, tokenType)
    const roundedAprValueInPercent = (market.marketApr / 100)?.toFixed(0)

    setInputLoanValue(formattedMaxLoanValue)
    setInputAprValue(roundedAprValueInPercent)
    setInputFreezeValue(String(DEFAULT_FREEZE_VALUE))
  }, [market, maxLoanValueByMarket, tokenType])

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

  const disabledListRequest =
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
    disabledListRequest,
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
          goToLoansPage()
          onBorrowSuccess(confirmed.length)
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
