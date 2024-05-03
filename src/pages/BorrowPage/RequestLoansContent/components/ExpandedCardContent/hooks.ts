import { useCallback, useEffect, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { uniqueId } from 'lodash'
import { useNavigate } from 'react-router-dom'
import { TxnExecutor } from 'solana-transactions-executor'

import { useBanxNotificationsSider } from '@banx/components/BanxNotifications'
import { MAX_APR_VALUE, MIN_APR_VALUE } from '@banx/components/PlaceOfferSection'
import {
  SubscribeNotificationsModal,
  createRequestLoanSubscribeNotificationsContent,
  createRequestLoanSubscribeNotificationsTitle,
} from '@banx/components/modals'

import { BorrowNft, Loan, MarketPreview } from '@banx/api/core'
import { BONDS, DAYS_IN_YEAR, SECONDS_IN_DAY } from '@banx/constants'
import { useBorrowNfts } from '@banx/pages/BorrowPage/hooks'
import { PATHS } from '@banx/router'
import {
  createPathWithTokenParam,
  useIsLedger,
  useLoansRequestsOptimistic,
  useModal,
  useTokenType,
} from '@banx/store'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import { createListTxnData } from '@banx/transactions/loans'
import {
  calcBorrowValueWithProtocolFee,
  convertToHumanNumber,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  formatDecimalWithoutTrailingZeros,
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

  const filteredNftsByMarket = useMemo(() => {
    return nfts.filter((nft) => nft.loan.marketPubkey === market.marketPubkey)
  }, [nfts, market])

  const handleNftsSelection = useCallback(
    (value = 0) => setSelection(filteredNftsByMarket.slice(0, value)),
    [filteredNftsByMarket, setSelection],
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

    //? Set the default APR and freeze values
    const aprValueInPercentStr = (market.marketApr / 100)?.toFixed(0)
    setInputAprValue(aprValueInPercentStr)
    setInputFreezeValue(String(DEFAULT_FREEZE_VALUE))

    //? Set the default max loan value, if available
    const maxLoanValue = maxLoanValueByMarket[market.marketPubkey]
    if (!maxLoanValue) return

    const convertedValue = convertToHumanNumber(maxLoanValue, tokenType)
    setInputLoanValue(formatDecimalWithoutTrailingZeros(convertedValue, tokenType))
  }, [market, maxLoanValueByMarket, tokenType, connected])

  //? Clear selection when marketPubkey changes
  useEffect(() => {
    setSelection([])
  }, [market.marketPubkey, setSelection, tokenType])

  const inputLoanValueToNumber = parseFloat(inputLoanValue)
  const inputAprValueToNumber = parseFloat(inputAprValue)
  const inputFreezeValueToNumber = parseFloat(inputFreezeValue)

  const requestedLoanValue = inputLoanValueToNumber * tokenDecimals

  const requestLoans = useRequestLoansTransaction({
    nfts: selectedNfts,
    aprValue: inputAprValueToNumber,
    loanValue: inputLoanValueToNumber,
    freezeValue: inputFreezeValueToNumber,
  })

  const { ltv, upfrontFee, weeklyInterest } = calculateSummaryInfo({
    requestedLoanValue,
    inputAprValue,
    totalNftsToRequest,
    collectionFloor: market.collectionFloor,
  })

  const aprInputValueIsLow = inputAprValueToNumber < MIN_APR_VALUE
  const disabledListAction = !inputLoanValueToNumber || !totalNftsToRequest || aprInputValueIsLow

  const actionButtonText = aprInputValueIsLow
    ? `The min APR is ${MIN_APR_VALUE}%`
    : `List ${totalNftsToRequest <= 1 ? 'request' : `${totalNftsToRequest} requests`}`

  //? requestedLoanValue with upfront fee
  const lenderSeesLoanValue =
    requestedLoanValue + (requestedLoanValue - calcBorrowValueWithProtocolFee(requestedLoanValue))

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

    nfts: filteredNftsByMarket,
    isLoadingNfts,

    ltv,
    upfrontFee,
    weeklyInterest,
    lenderSeesLoanValue,

    tokenType,

    requestLoans,
    disabledListAction,
    actionButtonText,
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
  const { isLedger } = useIsLedger()

  const navigate = useNavigate()
  const { setVisibility: setBanxNotificationsSiderVisibility } = useBanxNotificationsSider()
  const { open: openModal, close: closeModal } = useModal()
  const { add: addLoansOptimistic } = useLoansRequestsOptimistic()

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

    try {
      const tokenDecimals = getTokenDecimals(tokenType)
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const rateBasePoints = aprValue * 100
      const rateBasePointsWithoutProtocolFee = rateBasePoints - BONDS.PROTOCOL_REPAY_FEE

      const txnsData = await Promise.all(
        nfts.map((nft) =>
          createListTxnData({
            nft,
            aprRate: rateBasePointsWithoutProtocolFee,
            loanValue: loanValue * tokenDecimals,
            freeze: freezeValue * SECONDS_IN_DAY, //? days to seconds
            tokenType,
            walletAndConnection,
          }),
        ),
      )

      await new TxnExecutor(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
        chunkSize: isLedger ? 5 : 40,
      })
        .addTxnsData(txnsData)
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
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: nfts,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'ListLoans',
      })
    }
  }

  return requestLoans
}
