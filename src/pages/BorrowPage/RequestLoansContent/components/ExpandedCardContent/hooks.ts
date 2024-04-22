import { useCallback, useEffect, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { MAX_APR_VALUE } from '@banx/components/PlaceOfferSection'

import { MarketPreview } from '@banx/api/core'
import { DAYS_IN_YEAR, TXN_EXECUTOR_CONFIRM_OPTIONS } from '@banx/constants'
import { useBorrowNfts } from '@banx/pages/BorrowPage/hooks'
import { usePriorityFees, useTokenType } from '@banx/store'
import { createWalletInstance, defaultTxnErrorHandler } from '@banx/transactions'
import { makeListAction } from '@banx/transactions/listing'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  formatValueByTokenType,
  getTokenDecimals,
} from '@banx/utils'

import { useSelectedNfts } from '../../nftsState'
import { DEFAULT_FREEZE_VALUE } from './constants'
import { calculateSummaryInfo, clampInputValue } from './helpers'

export const useRequestLoansForm = (market: MarketPreview) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { priorityLevel } = usePriorityFees()

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

  const inputLoanValueToNumber = parseFloat(inputLoanValue)
  const requestedLoanValue = inputLoanValueToNumber * tokenDecimals

  const onSubmit = async () => {
    const loadingSnackbarId = uniqueId()

    const txnParams = selectedNfts.map((nft) => {
      return {
        nft,
        aprRate: parseFloat(inputAprValue),
        loanValue: parseFloat(inputLoanValue),
        freeze: parseFloat(inputFreezeValue),
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

        if (failed.length) {
          return failed.forEach(({ signature, reason }) =>
            enqueueConfirmationError(signature, reason),
          )
        }

        return confirmed.forEach(({ result, signature }) => {
          if (result) {
            enqueueSnackbar({
              message: 'Listings successfully initialized',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })
          }
        })
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

    onSubmit,
    disabledListRequest,
  }
}
