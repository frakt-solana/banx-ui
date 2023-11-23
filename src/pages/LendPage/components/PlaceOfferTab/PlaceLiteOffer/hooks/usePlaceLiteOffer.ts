import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { isEmpty } from 'lodash'

import { useSolanaBalance } from '@banx/utils'

import { getUpdatedBondOffer, shouldShowDepositError } from '../../helpers'
import { OfferParams } from '../../hooks'
import { useOfferTransactions } from '../../hooks/useOfferTransactions'
import { calcLoanToValuePercentage, calculateBestLoanValue } from '../helpers'
import { useOfferFormController } from './useOfferFormController'

export const usePlaceLiteOffer = ({
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
    onLoanValueChange,
    onLoanAmountChange,
    hasFormChanges,
    resetFormValues,
  } = useOfferFormController(syntheticOffer?.loanValue / 1e9, syntheticOffer?.loansAmount)

  const loanValueNumber = parseFloat(loanValue)
  const loansAmountNumber = parseFloat(loansAmount)

  useEffect(() => {
    const hasSolanaBalance = !!solanaBalance
    const isNotEditMode = !syntheticOffer.isEdit

    if (hasSolanaBalance && isNotEditMode && connected && !isEmpty(marketPreview)) {
      const bestLoanValue = calculateBestLoanValue(solanaBalance, marketPreview.bestOffer)

      onLoanValueChange(bestLoanValue)
    }
  }, [marketPreview, connected, solanaBalance, syntheticOffer, onLoanValueChange])

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

  const { onCreateOffer, onRemoveOffer, onUpdateOffer, onClaimOfferInterest } =
    useOfferTransactions({
      marketPubkey,
      offerPubkey,
      loanValue: loanValueNumber,
      loansAmount: loansAmountNumber,
      optimisticOffer,
      updateOrAddOffer,
      resetFormValues,
      exitEditMode,
    })

  const offerSize = useMemo(() => {
    const formattedDeltaValue = syntheticOffer.deltaValue / 1e9

    const updatedBondOffer = getUpdatedBondOffer({
      loanValue: loanValueNumber,
      loansQuantity: loansAmountNumber,
      deltaValue: formattedDeltaValue,
      syntheticOffer,
    })
    return updatedBondOffer.fundsSolOrTokenBalance
  }, [syntheticOffer, loanValueNumber, loansAmountNumber])

  const showDepositError = shouldShowDepositError({
    initialLoansAmount: syntheticOffer.loansAmount,
    initialLoanValue: syntheticOffer.loanValue,
    solanaBalance,
    offerSize,
  })

  const showBorrowerMessage = !showDepositError && !!offerSize
  const disablePlaceOffer = connected ? showDepositError || !offerSize : false
  const disableUpdateOffer = !hasFormChanges || showDepositError || !offerSize

  const loanToValuePercent = calcLoanToValuePercentage(loanValue, marketPreview)

  return {
    isEditMode: syntheticOffer.isEdit,
    offerSize,
    loanToValuePercent,
    marketApr: marketPreview?.marketApr || 0,
    loanValue,
    loansAmount,

    onLoanValueChange,
    onLoanAmountChange,

    showDepositError: showDepositError && connected,
    showBorrowerMessage,

    disableUpdateOffer,
    disablePlaceOffer,

    onClaimOfferInterest,
    onCreateOffer,
    onRemoveOffer,
    onUpdateOffer,
  }
}
