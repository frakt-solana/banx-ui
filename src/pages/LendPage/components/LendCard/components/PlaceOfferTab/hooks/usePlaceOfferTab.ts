import { useState } from 'react'

import { BondFeatures } from 'fbonds-core/lib/fbond-protocol/types'

import { RBOption } from '@banx/components/RadioButton'

import { DEFAULT_BOND_FEATURE } from '../constants'

export const usePlaceOfferTab = () => {
  const [loanValueInput, setLoanValueInput] = useState<string>('0')
  const [loansAmountInput, setLoansAmountInput] = useState<string>('1')
  const [bondFeature, setBondFeature] = useState<BondFeatures>(DEFAULT_BOND_FEATURE)

  const onBondFeatureChange = (nextValue: RBOption<BondFeatures>) => {
    setBondFeature(nextValue.value)
  }
  const onLoanValueChange = (nextValue: string) => {
    setLoanValueInput(nextValue)
  }

  const onLoanAmountChange = (nextValue: string) => {
    setLoansAmountInput(nextValue)
  }

  return {
    bondFeature,
    onBondFeatureChange,
    onLoanValueChange,
    loanValueInput,
    onLoanAmountChange,
    loansAmountInput,
  }
}
