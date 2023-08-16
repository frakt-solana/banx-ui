import { useEffect, useMemo } from 'react'

import { useMarketOffers, useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { useSolanaBalance } from '@banx/utils'

import { useOfferStore } from '../../ExpandableCardContent/hooks'
import { parseMarketOrder } from '../../OrderBook/helpers'
import { shouldShowDepositError } from '../helpers'
import { useOfferFormController } from './useOfferFormController'
import { useOfferTransactions } from './useOfferTransactions'

export const usePlaceOfferTab = (marketPubkey: string) => {
  const { offerPubkey, setOfferPubkey, setSyntheticParams } = useOfferStore()

  const { offers, updateOrAddOffer } = useMarketOffers({ marketPubkey })
  const { marketsPreview } = useMarketsPreview()
  const solanaBalance = useSolanaBalance()

  const marketPreview = marketsPreview.find((market) => market.marketPubkey === marketPubkey)

  const selectedOffer = useMemo(
    () => offers.find((offer) => offer.publicKey === offerPubkey),
    [offers, offerPubkey],
  )

  const initialOrderData = selectedOffer ? parseMarketOrder(selectedOffer) : null
  const { loanValue: initialLoanValue, loansAmount: initialLoansAmount } = initialOrderData || {}

  const isEditMode = !!offerPubkey

  const {
    loanValue,
    loansAmount,
    onLoanValueChange,
    onLoanAmountChange,
    hasFormChanges,
    resetFormValues,
  } = useOfferFormController(initialLoanValue, initialLoansAmount)

  const loansAmountNumber = parseFloat(loansAmount)
  const loanValueNumber = parseFloat(loanValue)

  useEffect(() => {
    if (loansAmountNumber || loanValueNumber) {
      setSyntheticParams({
        loanValue: loanValueNumber,
        loansAmount: loansAmountNumber,
      })
    }
  }, [loansAmountNumber, loanValueNumber, setSyntheticParams])

  const goToPlaceOffer = () => {
    setOfferPubkey('')
  }

  const { onCreateOffer, onRemoveOffer, onUpdateOffer } = useOfferTransactions({
    marketPubkey,
    offerPubkey,
    loanValue: loanValueNumber,
    loansAmount: loansAmountNumber,
    offers,
    updateOrAddOffer,
    resetFormValues,
    goToPlaceOffer,
  })

  const offerSize = loanValueNumber * loansAmountNumber || 0

  const showDepositError = shouldShowDepositError({
    initialLoansAmount,
    initialLoanValue,
    solanaBalance,
    offerSize,
  })

  return {
    isEditMode,
    offerSize,
    marketAPR: marketPreview?.marketAPR || 0,
    loanValue,
    loansAmount,

    goToPlaceOffer,
    onLoanValueChange,
    onLoanAmountChange,

    showDepositError,

    disableUpdateOffer: !hasFormChanges || showDepositError,

    offerTransactions: {
      onCreateOffer,
      onRemoveOffer,
      onUpdateOffer,
    },
  }
}
