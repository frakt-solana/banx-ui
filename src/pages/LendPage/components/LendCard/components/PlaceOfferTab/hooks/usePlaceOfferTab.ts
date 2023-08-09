import { useEffect, useState } from 'react'

import { RBOption } from '@banx/components/RadioButton'

import { useOfferStore } from '../../ExpandableCardContent/hooks'
import { DEFAULT_BOND_FEATURE } from '../constants'
import { useOfferTransactions } from './useOfferTransactions'

export const usePlaceOfferTab = (marketPubkey: string) => {
  const { pairPubkey, setPairPubkey, setSyntheticParams } = useOfferStore()

  const [loanValue, setLoanValue] = useState<string>('0')
  const [loansAmount, setLoansAmount] = useState<string>('1')
  const [bondFeature, setBondFeature] = useState<string>(DEFAULT_BOND_FEATURE)

  const isEdit = !!pairPubkey

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
    setPairPubkey('')
  }

  useEffect(() => {
    if (loanValue) {
      setSyntheticParams({
        loanValue: parseFloat(loanValue),
        loansAmount: parseFloat(loansAmount),
      })
    }
  }, [loanValue, loansAmount, setSyntheticParams])

  const { onCreateOffer, onRemoveOffer } = useOfferTransactions({
    marketPubkey,
    pairPubkey,
    loanValue: parseFloat(loanValue),
    loansAmount: parseFloat(loansAmount),
  })

  return {
    isEdit,

    goToPlaceOffer,

    bondFeature,
    onBondFeatureChange,
    onLoanValueChange,
    loanValue,
    onLoanAmountChange,
    loansAmount,

    onCreateOffer,
    onRemoveOffer,
  }
}
