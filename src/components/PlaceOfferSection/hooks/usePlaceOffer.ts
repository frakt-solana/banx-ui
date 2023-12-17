import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { chain, isEmpty, sortBy } from 'lodash'

import { MarketPreview, Offer } from '@banx/api/core'
import { convertOffersToSimple } from '@banx/pages/BorrowPage/helpers'
import { SyntheticOffer } from '@banx/store'
import { formatDecimal, useSolanaBalance } from '@banx/utils'

import { Mark } from '../PlaceOfferContent/components'
import {
  convertLoanToMark,
  convertOfferToMark,
  convertSimpleOfferToMark,
} from '../PlaceOfferContent/components/Diagram'
import { OfferMode } from '../components'
import { calcBestOfferValue, calcOfferSize, getErrorMessage, getUpdatedBondOffer } from '../helpers'
import { useMarketAndOffer, useOfferMode, useSyntheticOffer } from './hooks'
import { useLenderLoans } from './useLenderLoans'
import { useOfferFormController } from './useOfferFormController'
import { useOfferTransactions } from './useOfferTransactions'

export interface PlaceOfferParams {
  market: MarketPreview | undefined
  optimisticOffer: Offer | undefined
  syntheticOffer: SyntheticOffer

  onChangeOfferMode: (mode: OfferMode) => void
  exitEditMode: () => void
  offerMode: OfferMode
  isProMode: boolean

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
}

type UsePlaceOffer = (props: {
  offerPubkey: string
  marketPubkey: string
  setOfferPubkey?: (offerPubkey: string) => void
}) => PlaceOfferParams

export const usePlaceOffer: UsePlaceOffer = ({ marketPubkey, offerPubkey, setOfferPubkey }) => {
  const { connected } = useWallet()
  const solanaBalance = useSolanaBalance()

  const { lenderLoans } = useLenderLoans(offerPubkey)
  const { offer, market, updateOrAddOffer } = useMarketAndOffer(offerPubkey, marketPubkey)
  const { syntheticOffer, removeSyntheticOffer, setSyntheticOffer } = useSyntheticOffer(
    offerPubkey,
    marketPubkey,
  )

  const { offerMode, onChangeOfferMode } = useOfferMode(syntheticOffer)
  const isEditMode = syntheticOffer.isEdit
  const isProMode = offerMode === OfferMode.Pro

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

  const deltaValue = isProMode ? parseFloat(deltaValueString) * 1e9 : 0
  const loanValue = parseFloat(loanValueString) * 1e9
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

  const offerErrorMessage = getErrorMessage({
    syntheticOffer,
    solanaBalance,
    offerSize,
    loanValue,
    loansAmount,
    deltaValue,
    hasFormChanges,
  })

  useEffect(() => {
    const shouldSetBestOfferValue = !!solanaBalance && !isEditMode && connected && !isEmpty(market)
    if (shouldSetBestOfferValue) {
      const bestLoanValue = calcBestOfferValue({ solanaBalance, bestOffer: market.bestOffer })
      const formattedBestLoanValue = formatDecimal(bestLoanValue / 1e9)

      onLoanValueChange(formattedBestLoanValue)
    }
  }, [market, isEditMode, connected, solanaBalance, syntheticOffer, onLoanValueChange])

  const diagramData = useMemo(() => {
    if (!isEditMode) {
      return chain(new Array(loansAmount))
        .fill(loanValue)
        .map((offerValue, index) => convertOfferToMark(offerValue, index, deltaValue))
        .sortBy(({ value }) => value)
        .value()
    }

    if (!offer) return []

    const offerToUpdate = { syntheticOffer, loanValue, deltaValue, loansAmount }
    const offerToUse = hasFormChanges ? getUpdatedBondOffer(offerToUpdate) : offer

    const loansToMarks = lenderLoans.map(convertLoanToMark)
    const simpleOffersToMarks = convertOffersToSimple([offerToUse]).map(convertSimpleOfferToMark)

    return sortBy([...loansToMarks, ...simpleOffersToMarks], ({ value }) => value)
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

    offerMode,
    onChangeOfferMode,
    isProMode,

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
  }
}
