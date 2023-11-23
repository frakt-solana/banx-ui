import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { useSolanaBalance } from '@banx/utils'

import { getUpdatedBondOffer, shouldShowDepositError } from '../../helpers'
import { OfferParams } from '../../hooks'
import { useOfferTransactions } from '../../hooks/useOfferTransactions'
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
  } = useOfferFormController(syntheticOffer?.loanValue / 1e9, syntheticOffer?.loansAmount)

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

  const showDepositError = shouldShowDepositError({
    initialLoansAmount: syntheticOffer.loansAmount,
    initialLoanValue: syntheticOffer.loanValue,
    offerSize: offerSize,
    solanaBalance,
  })

  const showBorrowerMessage = !showDepositError && !!offerSize
  const disablePlaceOffer = connected ? showDepositError || !offerSize : false
  const disableUpdateOffer = !hasFormChanges || showDepositError || !offerSize

  return {
    isEditMode: syntheticOffer.isEdit,

    offerSize,
    marketApr: marketPreview?.marketApr || 0,

    loanValue,
    loansAmount,
    deltaValue,

    onDeltaValueChange,
    onLoanValueChange,
    onLoanAmountChange,

    disablePlaceOffer,
    disableUpdateOffer,
    showBorrowerMessage,
    showDepositError,

    onCreateOffer,
    onUpdateOffer,
    onClaimOfferInterest,
    onRemoveOffer,
  }
}
