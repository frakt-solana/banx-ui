import { useEffect, useMemo } from 'react'

import { chain } from 'lodash'

import { MarketPreview, Offer } from '@banx/api/core'
import { USDC_ADDRESS } from '@banx/constants'
import { SyntheticOffer, useToken } from '@banx/store'
import {
  TokenType,
  convertOffersToSimple,
  getDecimals,
  useSolanaBalance,
  useTokenBalance,
} from '@banx/utils'

import { Mark } from '../PlaceOfferContent/components'
import {
  convertLoanToMark,
  convertOfferToMark,
  convertSimpleOfferToMark,
} from '../PlaceOfferContent/components/Diagram'
import { calcOfferSize, getErrorMessage, getUpdatedBondOffer } from '../helpers'
import { useLenderLoans } from './useLenderLoans'
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

  diagramData: Mark[]
  isLoadingDiagram: boolean
}

type UsePlaceOffer = (props: {
  offerPubkey: string
  marketPubkey: string
  setOfferPubkey?: (offerPubkey: string) => void
}) => PlaceOfferParams

export const usePlaceOffer: UsePlaceOffer = ({ marketPubkey, offerPubkey, setOfferPubkey }) => {
  const { token: tokenType } = useToken()

  const solanaBalance = useSolanaBalance({ isLive: tokenType === TokenType.SOL })
  const usdcBalance = useTokenBalance(USDC_ADDRESS, { isLive: tokenType === TokenType.USDC })

  const tokenBalance = tokenType === TokenType.SOL ? solanaBalance : usdcBalance

  const { offer, market, updateOrAddOffer } = useMarketAndOffer(offerPubkey, marketPubkey)
  const { syntheticOffer, removeSyntheticOffer, setSyntheticOffer } = useSyntheticOffer(
    offerPubkey,
    marketPubkey,
  )

  const isEditMode = syntheticOffer.isEdit

  const { lenderLoans, isLoading: isLoadingLenderLoans } = useLenderLoans({ offerPubkey })

  const decimals = getDecimals(tokenType)

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
    tokenBalance,
    offerSize,
    loanValue,
    loansAmount,
    deltaValue,
    hasFormChanges,
  })

  const diagramData = useMemo(() => {
    const isOfferInvalid =
      deltaValue && hasFormChanges ? deltaValue * loansAmount > loanValue : false

    if (isOfferInvalid) return []

    if (!isEditMode) {
      return chain(new Array(loansAmount))
        .fill(loanValue)
        .map((offerValue, index) => convertOfferToMark(offerValue, index, deltaValue))
        .sortBy(({ value }) => value)
        .reverse()
        .value()
    }

    if (!offer) return []

    const offerToUpdate = { syntheticOffer, loanValue, deltaValue, loansAmount }
    const offerToUse = hasFormChanges ? getUpdatedBondOffer(offerToUpdate) : offer

    const loansToMarks = lenderLoans.map(convertLoanToMark)
    const simpleOffersToMarks = convertOffersToSimple([offerToUse]).map(convertSimpleOfferToMark)

    return chain([...loansToMarks, ...simpleOffersToMarks])
      .filter(({ value }) => value > 0)
      .sortBy(({ value }) => value)
      .reverse()
      .value()
  }, [
    isEditMode,
    loansAmount,
    loanValue,
    deltaValue,
    offer,
    hasFormChanges,
    syntheticOffer,
    lenderLoans,
  ])

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

    diagramData,
    isLoadingDiagram: isEditMode ? isLoadingLenderLoans : false,
  }
}
