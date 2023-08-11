import { useEffect, useState } from 'react'

import { RBOption } from '@banx/components/RadioButton'

import { useMarketOffers } from '@banx/pages/LendPage/hooks'

import { useOfferStore } from '../../ExpandableCardContent/hooks'
import { parseMarketOrder } from '../../OrderBook/helpers'
import { DEFAULT_BOND_FEATURE } from '../constants'
import { useOfferTransactions } from './useOfferTransactions'

export const usePlaceOfferTab = (marketPubkey: string) => {
  const { offerPubkey, setOfferPubkey, setSyntheticParams } = useOfferStore()

  const [loanValue, setLoanValue] = useState<string>('0')
  const [loansAmount, setLoansAmount] = useState<string>('1')
  const [bondFeature, setBondFeature] = useState<string>(DEFAULT_BOND_FEATURE)

  const { offers, removeOffer, updateOrAddOffer } = useMarketOffers({ marketPubkey })

  const offer = offers.find((offer) => offer.publicKey === offerPubkey)
  const initialOrderValues = offer ? parseMarketOrder(offer) : null
  const { loanValue: initialLoanValue, loansAmount: initialLoansAmount } = initialOrderValues || {}

  const isEdit = !!offerPubkey

  const onBondFeatureChange = (nextValue: RBOption) => {
    setBondFeature(nextValue.value)
  }
  const onLoanValueChange = (nextValue: string) => {
    setLoanValue(nextValue)
  }

  const onLoanAmountChange = (nextValue: string) => {
    setLoansAmount(nextValue)
  }

  const goToPlaceOffer = () => {
    setOfferPubkey('')
  }

  useEffect(() => {
    if (initialLoanValue || initialLoansAmount) {
      setLoansAmount(String(initialLoansAmount || 0))
      setLoanValue(String(initialLoanValue || 0))
    }
  }, [initialLoanValue, initialLoansAmount])

  useEffect(() => {
    if (loanValue) {
      setSyntheticParams({
        loanValue: parseFloat(loanValue),
        loansAmount: parseFloat(loansAmount),
      })
    }
  }, [loanValue, loansAmount, setSyntheticParams])

  const { onCreateOffer, onRemoveOffer, onUpdateOffer } = useOfferTransactions({
    marketPubkey,
    offerPubkey,
    loanValue: parseFloat(loanValue),
    loansAmount: parseFloat(loansAmount),
    offers,
    removeOffer,
    updateOrAddOffer,
  })

  const offerSize = parseFloat(loanValue) * parseFloat(loansAmount) || 0

  return {
    isEdit,

    goToPlaceOffer,

    bondFeature,
    onBondFeatureChange,
    onLoanValueChange,
    loanValue,
    onLoanAmountChange,
    loansAmount,
    offerSize,

    onCreateOffer,
    onRemoveOffer,
    onUpdateOffer,
  }
}
