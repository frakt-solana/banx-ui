import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { isEmpty } from 'lodash'

import { useSolanaBalance } from '@banx/utils'

import { calculateBestLoanValue } from '../../PlaceLiteOffer/helpers'
import { getUpdatedBondOffer } from '../../helpers'
import { OfferParams } from '../../hooks'
import { useOfferTransactions } from '../../hooks/useOfferTransactions'
import { getOfferErrorMessage } from '../helpers'
import { useOfferFormController } from './useOfferFormController'

export const usePlaceProOffer = ({
  offerPubkey,
  exitEditMode,
  syntheticOffer,
  marketPreview,
  setSyntheticOffer,
  optimisticOffer,
  updateOrAddOffer,
}: OfferParams) => {
  const { connected } = useWallet()
  const marketPubkey = marketPreview?.marketPubkey || ''

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

  const { onCreateOffer, onUpdateOffer, onRemoveOffer, onClaimOfferInterest } =
    useOfferTransactions({
      marketPubkey,
      offerPubkey,
      loanValue: loanValueNumber,
      loansAmount: loansAmountNumber,
      deltaValue: deltaValueNumber,
      optimisticOffer,
      updateOrAddOffer,
      resetFormValues,
      exitEditMode,
    })

  const offerSize = useMemo(() => {
    const updatedBondOffer = getUpdatedBondOffer({
      loanValue: loanValueNumber,
      deltaValue: deltaValueNumber,
      loansQuantity: loansAmountNumber,
      syntheticOffer,
    })
    return updatedBondOffer.fundsSolOrTokenBalance
  }, [syntheticOffer, deltaValueNumber, loanValueNumber, loansAmountNumber])

  useEffect(() => {
    const hasSolanaBalance = !!solanaBalance
    const isNotEditMode = !syntheticOffer.isEdit

    if (hasSolanaBalance && isNotEditMode && connected && !isEmpty(marketPreview)) {
      const bestLoanValue = calculateBestLoanValue(solanaBalance, marketPreview.bestOffer)
      onLoanValueChange(bestLoanValue)
    }
  }, [marketPreview, connected, solanaBalance, syntheticOffer, onLoanValueChange])

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

  const offerErrorMessage = getOfferErrorMessage({ syntheticOffer, solanaBalance, offerSize })

  const showBorrowerMessage = !offerErrorMessage && !!offerSize
  const disablePlaceOffer = !!offerErrorMessage || !offerSize
  const disableUpdateOffer = !hasFormChanges || !!offerErrorMessage || !offerSize

  return {
    isEditMode: syntheticOffer.isEdit,

    loanValue,
    loansAmount,
    deltaValue,
    offerSize,

    onDeltaValueChange,
    onLoanValueChange,
    onLoanAmountChange,

    disablePlaceOffer,
    disableUpdateOffer,
    showBorrowerMessage,
    offerErrorMessage,

    onCreateOffer,
    onUpdateOffer,
    onClaimOfferInterest,
    onRemoveOffer,
  }
}
