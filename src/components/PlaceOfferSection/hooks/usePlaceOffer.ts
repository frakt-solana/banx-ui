import { useEffect, useMemo } from 'react'

import { MarketPreview, Offer } from '@banx/api/core'
import { SyntheticOffer, useTokenType } from '@banx/store'
import { getTokenDecimals, useWalletBalance } from '@banx/utils'

import { calcOfferSize, getErrorMessage, getUpdatedBondOffer } from '../helpers'
import { useMarketAndOffer } from './useMarketAndOffer'
import { useOfferFormController } from './useOfferFormController'
import { useOfferTransactions } from './useOfferTransactions'
import { useSyntheticOffer } from './useSyntheticOffer'

export interface PlaceOfferParams {
  market: MarketPreview | undefined
  optimisticOffer: Offer | undefined
  updatedOffer: Offer | undefined
  syntheticOffer: SyntheticOffer

  exitEditMode: () => void

  offerErrorMessage: string
  hasFormChanges: boolean

  onCreateOffer: () => void
  onRemoveOffer: () => void
  onUpdateOffer: () => void

  loansAmount: string
  deltaValue: string
  loanValue: string
  offerSize: number

  onDeltaValueChange: (value: string) => void
  onLoanValueChange: (value: string) => void
  onLoanAmountChange: (value: string) => void
}

type UsePlaceOffer = (props: {
  offerPubkey: string
  marketPubkey: string
  setOfferPubkey?: (offerPubkey: string) => void
}) => PlaceOfferParams

export const usePlaceOffer: UsePlaceOffer = ({ marketPubkey, offerPubkey, setOfferPubkey }) => {
  const { tokenType } = useTokenType()

  const walletBalance = useWalletBalance(tokenType)

  const { offer, market, updateOrAddOffer } = useMarketAndOffer(offerPubkey, marketPubkey)
  const { syntheticOffer, removeSyntheticOffer, setSyntheticOffer } = useSyntheticOffer(
    offerPubkey,
    marketPubkey,
  )

  const decimals = getTokenDecimals(tokenType)

  const {
    loanValue: loanValueString,
    loansAmount: loansAmountString,
    deltaValue: deltaValueString,
    onDeltaValueChange,
    onLoanValueChange,
    onLoanAmountChange,
    hasFormChanges,
    resetFormValues,
  } = useOfferFormController(syntheticOffer)

  const deltaValue = parseFloat(deltaValueString) * decimals
  const loanValue = parseFloat(loanValueString) * decimals
  const loansAmount = parseFloat(loansAmountString)

  const exitEditMode = () => {
    if (!setOfferPubkey) return

    setOfferPubkey('')
    removeSyntheticOffer()
  }

  useEffect(() => {
    if (!syntheticOffer) return
    const newSyntheticOffer = { ...syntheticOffer, deltaValue, loanValue, loansAmount }

    setSyntheticOffer(newSyntheticOffer)
  }, [syntheticOffer, setSyntheticOffer, deltaValue, loanValue, loansAmount])

  const { onCreateOffer, onRemoveOffer, onUpdateOffer } = useOfferTransactions({
    marketPubkey,
    loanValue,
    loansAmount,
    optimisticOffer: offer,
    deltaValue,
    updateOrAddOffer,
    resetFormValues,
    exitEditMode,
  })

  const offerSize = useMemo(() => {
    return calcOfferSize({ syntheticOffer, loanValue, loansAmount, deltaValue })
  }, [syntheticOffer, loanValue, loansAmount, deltaValue])

  const updatedOffer = useMemo(() => {
    return getUpdatedBondOffer({ syntheticOffer, loanValue, loansAmount, deltaValue })
  }, [syntheticOffer, loanValue, loansAmount, deltaValue])

  const offerErrorMessage = getErrorMessage({
    syntheticOffer,
    walletBalance,
    offerSize,
    loanValue,
    loansAmount,
    deltaValue,
    hasFormChanges,
    tokenType,
  })

  return {
    market,
    optimisticOffer: offer,
    syntheticOffer,
    updatedOffer,

    loanValue: loanValueString,
    loansAmount: loansAmountString,
    deltaValue: deltaValueString,
    offerSize,

    onDeltaValueChange,
    onLoanValueChange,
    onLoanAmountChange,

    offerErrorMessage,
    hasFormChanges,

    exitEditMode,
    onCreateOffer,
    onRemoveOffer,
    onUpdateOffer,
  }
}
