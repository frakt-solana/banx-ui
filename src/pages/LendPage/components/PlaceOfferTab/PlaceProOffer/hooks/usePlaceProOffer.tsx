import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { isEmpty } from 'lodash'

import { formatDecimal, useSolanaBalance } from '@banx/utils'

import { calculateBestLoanValue, calculateOfferSize, getOfferErrorMessage } from '../../helpers'
import { OfferParams } from '../../hooks'
import { useOfferTransactions } from '../../hooks/useOfferTransactions'
import { useOfferFormController } from './useOfferFormController'

export const usePlaceProOffer = ({
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
    deltaValue,
    onDeltaValueChange,
    onLoanValueChange,
    onLoanAmountChange,
    resetFormValues,
    hasFormChanges,
  } = useOfferFormController(syntheticOffer)

  const loanValueNumber = parseFloat(loanValue)
  const loansAmountNumber = parseFloat(loansAmount)
  const deltaValueNumber = parseFloat(deltaValue)

  const { onCreateOffer, onUpdateOffer, onRemoveOffer, onWithdrawReserve } = useOfferTransactions({
    marketPubkey,
    loanValue: loanValueNumber,
    loansAmount: loansAmountNumber,
    deltaValue: deltaValueNumber,
    optimisticOffer,
    updateOrAddOffer,
    resetFormValues,
    exitEditMode,
  })

  const offerSize = useMemo(() => {
    return calculateOfferSize({
      syntheticOffer,
      loanValue: loanValueNumber,
      loansQuantity: loansAmountNumber,
      deltaValue: deltaValueNumber,
    })
  }, [syntheticOffer, loanValueNumber, loansAmountNumber, deltaValueNumber])

  useEffect(() => {
    const hasSolanaBalance = !!solanaBalance

    if (hasSolanaBalance && !isEditMode && connected && !isEmpty(marketPreview)) {
      const bestLoanValue = calculateBestLoanValue(solanaBalance, marketPreview.bestOffer)
      onLoanValueChange(formatDecimal(bestLoanValue))
    }
  }, [marketPreview, isEditMode, connected, solanaBalance, syntheticOffer, onLoanValueChange])

  useEffect(() => {
    if (loansAmountNumber || loanValueNumber || deltaValueNumber) {
      if (!syntheticOffer) return
      const formattedLoanValue = loanValueNumber * 1e9
      const formattedDeltaValue = deltaValueNumber * 1e9

      setSyntheticOffer({
        ...syntheticOffer,
        loanValue: formattedLoanValue,
        loansAmount: loansAmountNumber,
        deltaValue: formattedDeltaValue,
      })
    }
  }, [loansAmountNumber, deltaValueNumber, loanValueNumber, syntheticOffer, setSyntheticOffer])

  const offerErrorMessage = getOfferErrorMessage({
    syntheticOffer,
    solanaBalance,
    offerSize,
    loanValue: loanValueNumber,
    loansAmount: loansAmountNumber,
    deltaValue: deltaValueNumber,
    hasFormChanges,
  })

  const showBorrowerMessage = !offerErrorMessage && !!offerSize
  const disablePlaceOffer = !!offerErrorMessage || !offerSize
  const disableUpdateOffer = !hasFormChanges || !!offerErrorMessage || !offerSize
  const disableWithdrawReserve = !optimisticOffer?.bidSettlement

  return {
    isEditMode,

    loanValue,
    loansAmount,
    deltaValue,
    offerSize,

    onDeltaValueChange,
    onLoanValueChange,
    onLoanAmountChange,

    disablePlaceOffer,
    disableUpdateOffer,
    disableWithdrawReserve,
    showBorrowerMessage,
    offerErrorMessage,

    onCreateOffer,
    onUpdateOffer,
    onWithdrawReserve,
    onRemoveOffer,
  }
}
