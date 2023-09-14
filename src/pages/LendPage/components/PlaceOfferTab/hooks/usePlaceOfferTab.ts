import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { useMarketOffers, useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { useSolanaBalance } from '@banx/utils'

import { PlaceOfferParams } from '../../ExpandableCardContent'
import { parseMarketOrder } from '../../OrderBook/helpers'
import { shouldShowDepositError } from '../helpers'
import { useOfferFormController } from './useOfferFormController'
import { useOfferTransactions } from './useOfferTransactions'

export const usePlaceOfferTab = (props: PlaceOfferParams) => {
  const { marketPubkey, offerPubkey, setOfferPubkey, setSyntheticParams } = props

  const { offers, updateOrAddOffer } = useMarketOffers({ marketPubkey })
  const { marketsPreview } = useMarketsPreview()
  const solanaBalance = useSolanaBalance()

  const { connected } = useWallet()

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

  const disablePlaceOffer = connected ? showDepositError || !offerSize : false
  const disableUpdateOffer = !hasFormChanges || showDepositError

  return {
    isEditMode,
    offerSize,
    marketApr: marketPreview?.marketApr || 0,
    loanValue,
    loansAmount,

    goToPlaceOffer,
    onLoanValueChange,
    onLoanAmountChange,

    showDepositError: showDepositError && connected,

    disableUpdateOffer,
    disablePlaceOffer,

    offerTransactions: {
      onCreateOffer,
      onRemoveOffer,
      onUpdateOffer,
    },
  }
}
