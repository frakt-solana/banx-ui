import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { useMarketOffers } from '@banx/pages/LendPage/hooks'
import { useSolanaBalance } from '@banx/utils'

import { shouldShowDepositError } from '../../helpers'
import { OfferParams } from '../../hooks'
import { useOfferTransactions } from '../../hooks/useOfferTransactions'
import { calculateOfferSize } from '../helpers'
import { useOfferFormController } from './useOfferFormController'

export const usePlaceProOffer = ({
  offerPubkey,
  exitEditMode,
  syntheticOffer,
  marketPreview,
  setSyntheticOffer,
}: OfferParams) => {
  const { connected } = useWallet()
  const marketPubkey = marketPreview?.marketPubkey || ''

  const { offers, updateOrAddOffer } = useMarketOffers({ marketPubkey })
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

  const { onCreateBondingOffer, onUpdateBondingOffer, onRemoveOffer } = useOfferTransactions({
    marketPubkey,
    offerPubkey,
    loanValue: loanValueNumber,
    loansAmount: loansAmountNumber,
    deltaValue: deltaValueNumber,
    offers,
    updateOrAddOffer,
    resetFormValues,
    exitEditMode,
  })

  const offerSize = useMemo(() => {
    return calculateOfferSize({
      loanValue: loanValueNumber,
      deltaValue: deltaValueNumber,
      amountOfOrders: loansAmountNumber,
    })
  }, [deltaValueNumber, loanValueNumber, loansAmountNumber])

  useEffect(() => {
    if (loansAmountNumber || loanValueNumber) {
      if (!syntheticOffer) return
      const formattedLoanValue = loanValueNumber * 1e9

      setSyntheticOffer({
        ...syntheticOffer,
        loanValue: formattedLoanValue,
        loansAmount: loansAmountNumber,
      })
    }
  }, [loansAmountNumber, loanValueNumber, syntheticOffer, setSyntheticOffer])

  const showDepositError = shouldShowDepositError({
    initialLoansAmount: syntheticOffer.loansAmount,
    initialLoanValue: syntheticOffer.loanValue,
    offerSize: offerSize,
    solanaBalance,
  })

  const showBorrowerMessage = !showDepositError && !!offerSize
  const disablePlaceOffer = connected ? !offerSize : false
  const disableUpdateOffer = !hasFormChanges || !offerSize

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

    offerTransactions: {
      onCreateOffer: onCreateBondingOffer,
      onUpdateOffer: onUpdateBondingOffer,
      onRemoveOffer,
    },
  }
}
