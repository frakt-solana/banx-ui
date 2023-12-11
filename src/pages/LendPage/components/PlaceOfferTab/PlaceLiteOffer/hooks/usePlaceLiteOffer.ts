import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { isEmpty } from 'lodash'

import { formatDecimal, useSolanaBalance } from '@banx/utils'

import { calculateBestLoanValue, calculateOfferSize, getOfferErrorMessage } from '../../helpers'
import { OfferParams } from '../../hooks'
import { useOfferTransactions } from '../../hooks/useOfferTransactions'
import { calcLoanToValuePercentage } from '../helpers'
import { useOfferFormController } from './useOfferFormController'

export const usePlaceLiteOffer = ({
  exitEditMode,
  syntheticOffer,
  marketPreview,
  setSyntheticOffer,
  optimisticOffer,
  updateOrAddOffer,
}: OfferParams) => {
  const { connected } = useWallet()
  const marketPubkey = marketPreview?.marketPubkey || ''
  const isEditMode = syntheticOffer.isEdit

  const solanaBalance = useSolanaBalance()

  const {
    loanValue,
    loansAmount,
    onLoanValueChange,
    onLoanAmountChange,
    hasFormChanges,
    resetFormValues,
  } = useOfferFormController(syntheticOffer)

  const loanValueNumber = parseFloat(loanValue)
  const loansAmountNumber = parseFloat(loansAmount)

  useEffect(() => {
    const hasSolanaBalance = !!solanaBalance

    if (hasSolanaBalance && !isEditMode && connected && !isEmpty(marketPreview)) {
      const bestLoanValue = calculateBestLoanValue(solanaBalance, marketPreview.bestOffer)
      onLoanValueChange(formatDecimal(bestLoanValue))
    }
  }, [marketPreview, isEditMode, connected, solanaBalance, syntheticOffer, onLoanValueChange])

  useEffect(() => {
    if (loansAmountNumber || loanValueNumber) {
      if (!syntheticOffer) return

      setSyntheticOffer({
        ...syntheticOffer,
        loanValue: loanValueNumber * 1e9,
        loansAmount: loansAmountNumber,
      })
    }
  }, [loansAmountNumber, loanValueNumber, syntheticOffer, setSyntheticOffer])

  const { onCreateOffer, onRemoveOffer, onUpdateOffer } = useOfferTransactions({
    marketPubkey,
    loanValue: loanValueNumber,
    loansAmount: loansAmountNumber,
    optimisticOffer,
    updateOrAddOffer,
    resetFormValues,
    exitEditMode,
  })

  const offerSize = useMemo(() => {
    if (isEditMode && !hasFormChanges) {
      const {
        edgeSettlement = 0,
        bidSettlement = 0,
        fundsSolOrTokenBalance = 0,
      } = optimisticOffer || {}

      return edgeSettlement + bidSettlement + fundsSolOrTokenBalance
    }

    return calculateOfferSize({
      syntheticOffer,
      loanValue: loanValueNumber,
      loansQuantity: loansAmountNumber,
      deltaValue: 0,
    })
  }, [
    isEditMode,
    hasFormChanges,
    syntheticOffer,
    loanValueNumber,
    loansAmountNumber,
    optimisticOffer,
  ])

  const offerErrorMessage = getOfferErrorMessage({
    syntheticOffer,
    solanaBalance,
    offerSize,
    loanValue: loanValueNumber,
    loansAmount: loansAmountNumber,
    deltaValue: 0,
    hasFormChanges,
  })

  const showBorrowerMessage = !offerErrorMessage && !!offerSize
  const disablePlaceOffer = !!offerErrorMessage || !offerSize
  const disableUpdateOffer = !hasFormChanges || !!offerErrorMessage || !offerSize

  const loanToValuePercent = calcLoanToValuePercentage(loanValue, marketPreview)

  return {
    isEditMode,
    offerSize,
    loanToValuePercent,
    marketApr: marketPreview?.marketApr || 0,
    loanValue,
    loansAmount,

    onLoanValueChange,
    onLoanAmountChange,

    showBorrowerMessage,
    offerErrorMessage,

    disableUpdateOffer,
    disablePlaceOffer,

    onCreateOffer,
    onRemoveOffer,
    onUpdateOffer,
  }
}
