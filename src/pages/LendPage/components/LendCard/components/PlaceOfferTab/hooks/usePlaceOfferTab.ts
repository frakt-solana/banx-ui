import { useEffect, useMemo, useState } from 'react'

import { isEqual, pick } from 'lodash'

import { RBOption } from '@banx/components/RadioButton'

import { useMarketOffers } from '@banx/pages/LendPage/hooks'

import { useOfferStore } from '../../ExpandableCardContent/hooks'
import { parseMarketOrder } from '../../OrderBook/helpers'
import { DEFAULT_BOND_FEATURE } from '../constants'
import { useMarketsPreview } from './../../../../../hooks'
import { useOfferTransactions } from './useOfferTransactions'

const useOfferFormController = (initialLoanValue: number = 0, initialLoansAmount: number = 1) => {
  const [loanValue, setLoanValue] = useState(String(initialLoanValue))
  const [loansAmount, setLoansAmount] = useState(String(initialLoansAmount))
  const [bondFeature, setBondFeature] = useState<string>(DEFAULT_BOND_FEATURE)

  useEffect(() => {
    if (initialLoanValue || initialLoansAmount) {
      setLoanValue(String(initialLoanValue))
      setLoansAmount(String(initialLoansAmount))
    }
  }, [initialLoanValue, initialLoansAmount])

  const onBondFeatureChange = (nextValue: RBOption) => {
    setBondFeature(nextValue.value)
  }
  const onLoanValueChange = (nextValue: string) => {
    setLoanValue(nextValue)
  }

  const onLoanAmountChange = (nextValue: string) => {
    setLoansAmount(nextValue)
  }

  const resetFormValues = () => {
    setLoanValue(String(initialLoanValue))
    setLoansAmount(String(initialLoansAmount))
    setBondFeature(DEFAULT_BOND_FEATURE)
  }

  const currentFormValues = { loansAmount, loanValue }
  const initialFormValues = {
    loansAmount: String(initialLoansAmount),
    loanValue: String(initialLoanValue),
  }

  const hasFormChanges =
    (initialLoanValue || initialLoansAmount) &&
    !isEqual(pick(currentFormValues, Object.keys(initialFormValues)), initialFormValues)

  return {
    loanValue,
    loansAmount,
    bondFeature,
    onLoanValueChange,
    onLoanAmountChange,
    onBondFeatureChange,
    hasFormChanges: Boolean(hasFormChanges),
    resetFormValues,
  }
}

export const usePlaceOfferTab = (marketPubkey: string) => {
  const { offerPubkey, setOfferPubkey, setSyntheticParams } = useOfferStore()

  const { offers, removeOffer, updateOrAddOffer } = useMarketOffers({ marketPubkey })
  const { marketsPreview } = useMarketsPreview()

  const marketPreview = marketsPreview.find((market) => market.marketPubkey === marketPubkey)

  const offer = useMemo(
    () => offers.find((offer) => offer.publicKey === offerPubkey),
    [offers, offerPubkey],
  )

  const initialOrderValues = offer ? parseMarketOrder(offer) : null
  const { loanValue: initialLoanValue, loansAmount: initialLoansAmount } = initialOrderValues || {}

  const isEdit = !!offerPubkey

  const {
    loanValue,
    loansAmount,
    onLoanValueChange,
    onLoanAmountChange,
    bondFeature,
    onBondFeatureChange,
    hasFormChanges,
    resetFormValues,
  } = useOfferFormController(initialLoanValue, initialLoansAmount)

  useEffect(() => {
    if (loanValue) {
      setSyntheticParams({
        loanValue: parseFloat(loanValue),
        loansAmount: parseFloat(loansAmount),
      })
    }
  }, [loanValue, loansAmount, setSyntheticParams])

  const goToPlaceOffer = () => {
    setOfferPubkey('')
  }

  const { onCreateOffer, onRemoveOffer, onUpdateOffer } = useOfferTransactions({
    marketPubkey,
    offerPubkey,
    loanValue: parseFloat(loanValue),
    loansAmount: parseFloat(loansAmount),
    offers,
    removeOffer,
    updateOrAddOffer,
    resetFormValues,
    goToPlaceOffer,
  })

  const offerSize = parseFloat(loanValue) * parseFloat(loansAmount) || 0

  return {
    isEdit,
    offerSize,
    marketAPR: marketPreview?.marketAPR || 0,
    bondFeature,
    loanValue,
    loansAmount,
    hasFormChanges,

    goToPlaceOffer,
    onBondFeatureChange,
    onLoanValueChange,
    onLoanAmountChange,

    offerTransactions: {
      onCreateOffer,
      onRemoveOffer,
      onUpdateOffer,
    },
  }
}
