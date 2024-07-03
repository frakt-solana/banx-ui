import { useCallback, useEffect, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { chain, uniqueId } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { useBanxNotificationsSider } from '@banx/components/BanxNotifications'
import { MAX_BORROWER_APR_VALUE, MIN_BORROWER_APR_VALUE } from '@banx/components/PlaceOfferSection'
import {
  SubscribeNotificationsModal,
  createRequestLoanSubscribeNotificationsContent,
  createRequestLoanSubscribeNotificationsTitle,
} from '@banx/components/modals'

import { TxnExecutor } from '@banx/../../solana-txn-executor/src'
import { core } from '@banx/api/nft'
import { BONDS, DAYS_IN_YEAR, SECONDS_IN_DAY } from '@banx/constants'
import { useBorrowNfts } from '@banx/pages/nftLending/BorrowPage/hooks'
import { LoansTabsNames, useLoansTabs } from '@banx/pages/nftLending/LoansPage'
import { getDialectAccessToken } from '@banx/providers'
import { PATHS } from '@banx/router'
import { useIsLedger, useModal } from '@banx/store/common'
import { createPathWithTokenParam, useLoansRequestsOptimistic, useTokenType } from '@banx/store/nft'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateListTxnDataParams,
  createListTxnData,
  parseListNftSimulatedAccounts,
} from '@banx/transactions/nftLending'
import {
  calculateBorrowValueWithProtocolFee,
  convertToHumanNumber,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  formatDecimalWithoutTrailingZeros,
  getTokenDecimals,
} from '@banx/utils'

import { useSelectedNfts } from '../../nftsState'
import { DEFAULT_FREEZE_VALUE } from './constants'
import { calculateSummaryInfo, clampInputValue } from './helpers'

export const useRequestLoansForm = (market: core.MarketPreview) => {
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
    const clampedValue = clampInputValue(value, MAX_BORROWER_APR_VALUE)
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

  const aprInputValueIsLow = inputAprValueToNumber < MIN_BORROWER_APR_VALUE
  const disabledListAction = !inputLoanValueToNumber || !totalNftsToRequest || aprInputValueIsLow

  const actionButtonText = aprInputValueIsLow
    ? `The min APR is ${MIN_BORROWER_APR_VALUE}%`
    : `List ${totalNftsToRequest <= 1 ? 'loan' : `${totalNftsToRequest} loans`}`

  //? requestedLoanValue with upfront fee
  const lenderSeesLoanValue =
    requestedLoanValue +
    (requestedLoanValue - calculateBorrowValueWithProtocolFee(requestedLoanValue))

  const lenderSeesAprValue = !aprInputValueIsLow
    ? Math.round(inputAprValueToNumber - BONDS.PROTOCOL_REPAY_FEE / 100)
    : 0

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
    lenderSeesAprValue,

    tokenType,

    requestLoans,
    disabledListAction,
    actionButtonText,
  }
}

const useRequestLoansTransaction = (props: {
  nfts: core.BorrowNft[]
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

  const { setTab: setLoanTab } = useLoansTabs()

  const goToLoansPage = () => {
    setLoanTab(LoansTabsNames.REQUESTS)
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
          createListTxnData(
            {
              nft,
              aprRate: rateBasePointsWithoutProtocolFee,
              loanValue: loanValue * tokenDecimals,
              freeze: freezeValue * SECONDS_IN_DAY, //? days to seconds
              tokenType,
            },
            walletAndConnection,
          ),
        ),
      )

      await new TxnExecutor<CreateListTxnDataParams>(walletAndConnection, {
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

            const loans: core.Loan[] = chain(confirmed)
              .map(({ params, accountInfoByPubkey }) => {
                if (!accountInfoByPubkey) return
                const { bondTradeTransaction, fraktBond } =
                  parseListNftSimulatedAccounts(accountInfoByPubkey)

                return {
                  publicKey: fraktBond.publicKey,
                  fraktBond: fraktBond,
                  bondTradeTransaction: bondTradeTransaction,
                  nft: params.nft.nft,
                }
              })
              .compact()
              .value()

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
