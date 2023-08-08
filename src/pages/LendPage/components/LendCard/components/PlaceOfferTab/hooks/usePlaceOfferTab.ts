import { useEffect, useState } from 'react'

import { RBOption } from '@banx/components/RadioButton'

import { useMarket, useMarketPairs } from '@banx/utils/bonds'

import { useOfferStore } from '../../ExpandableCardContent/hooks'
import { DEFAULT_BOND_FEATURE } from '../constants'

export const usePlaceOfferTab = (marketPubkey: string) => {
  const { pairPubkey, setPairPubkey, setSyntheticParams, syntheticParams } = useOfferStore()

  const [loanValueInput, setLoanValueInput] = useState<string>('0')
  const [loansAmountInput, setLoansAmountInput] = useState<string>('1')
  const [bondFeature, setBondFeature] = useState<string>(DEFAULT_BOND_FEATURE)

  const { market, isLoading: marketLoading } = useMarket({ marketPubkey })
  const { pairs, isLoading: pairLoading } = useMarketPairs({ marketPubkey })

  const isEdit = !!pairPubkey

  console.log(pairPubkey, 'pairPubkey')
  const onBondFeatureChange = (nextValue: RBOption) => {
    setBondFeature(nextValue.value)
  }
  const onLoanValueChange = (nextValue: string) => {
    setLoanValueInput(nextValue)
  }

  const onLoanAmountChange = (nextValue: string) => {
    setLoansAmountInput(nextValue)
  }

  const goToPlaceOffer = () => {
    setPairPubkey('')
  }

  useEffect(() => {
    const loanValue = parseFloat(loanValueInput)
    const loanAmount = parseFloat(loansAmountInput)
    const offerSizeLamports = loanValue * loanAmount

    if (loanValue) {
      setSyntheticParams({
        loanValue,
        loanAmount,
        offerSize: offerSizeLamports,
      })
    }
  }, [loanValueInput, loansAmountInput, setSyntheticParams])

  return {
    isEdit,

    goToPlaceOffer,

    bondFeature,
    onBondFeatureChange,
    onLoanValueChange,
    loanValueInput,
    onLoanAmountChange,
    loansAmountInput,
  }
}
