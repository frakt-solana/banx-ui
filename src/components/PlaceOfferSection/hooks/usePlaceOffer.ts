import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { isEmpty } from 'lodash'

import { MarketPreview, Offer } from '@banx/api/core'
import { useMarketOffers, useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { createEmptySyntheticOffer, useSyntheticOffers } from '@banx/store'
import { formatDecimal, useSolanaBalance } from '@banx/utils'

import { OfferMode } from '../components'
import { calculateBestLoanValue, calculateOfferSize, getOfferErrorMessage } from '../helpers'
import { useOfferFormController } from './useOfferFormController'
import { useOfferTransactions } from './useOfferTransactions'

export interface OfferParams {
  marketPreview: MarketPreview | undefined
  optimisticOffer: Offer | undefined
  offerErrorMessage: string
  hasFormChanges: boolean
  isEditMode: boolean

  exitEditMode: () => void
  onCreateOffer: () => void
  onRemoveOffer: () => void
  onUpdateOffer: () => void

  loansAmount: string
  deltaValue: string
  loanValue: string
  offerSize: number

  onDeltaValueChange?: (value: string) => void
  onLoanValueChange: (value: string) => void
  onLoanAmountChange: (value: string) => void
}

type UsePlaceOffer = (props: {
  offerMode: OfferMode
  setOfferPubkey: (offerPubkey: string) => void
  offerPubkey: string
  marketPubkey: string
}) => OfferParams

export const usePlaceOffer: UsePlaceOffer = (props) => {
  const { marketPubkey, setOfferPubkey, offerPubkey, offerMode } = props

  const { connected } = useWallet()
  const solanaBalance = useSolanaBalance()

  const { offer, market, updateOrAddOffer } = useMarketAndOffer(offerPubkey, marketPubkey)
  const { syntheticOffer, removeSyntheticOffer, setSyntheticOffer } = useSyntheticOffer(
    offerPubkey,
    marketPubkey,
  )

  const isEditMode = syntheticOffer.isEdit
  const isProMode = offerMode === OfferMode.Pro

  const exitEditMode = () => {
    setOfferPubkey('')
    removeSyntheticOffer()
  }

  const {
    loanValue,
    loansAmount,
    deltaValue,
    onDeltaValueChange,
    onLoanValueChange,
    onLoanAmountChange,
    hasFormChanges,
    resetFormValues,
  } = useOfferFormController(syntheticOffer)

  const deltaValueNumber = isProMode ? parseFloat(deltaValue) : 0
  const loansAmountNumber = parseFloat(loansAmount)
  const loanValueNumber = parseFloat(loanValue)

  useEffect(() => {
    if (!syntheticOffer) return

    setSyntheticOffer({
      ...syntheticOffer,
      deltaValue: deltaValueNumber * 1e9,
      loanValue: loanValueNumber * 1e9,
      loansAmount: loansAmountNumber,
    })
  }, [syntheticOffer, setSyntheticOffer, deltaValueNumber, loanValueNumber, loansAmountNumber])

  const { onCreateOffer, onRemoveOffer, onUpdateOffer } = useOfferTransactions({
    marketPubkey,
    loanValue: loanValueNumber,
    loansAmount: loansAmountNumber,
    optimisticOffer: offer,
    deltaValue: deltaValueNumber,
    updateOrAddOffer,
    resetFormValues,
    exitEditMode,
  })

  const offerSize = useMemo(() => {
    return calculateOfferSize({
      syntheticOffer,
      loanValue: loanValueNumber,
      loansQuantity: loansAmountNumber,
      deltaValue: deltaValueNumber,
    })
  }, [syntheticOffer, loanValueNumber, loansAmountNumber, deltaValueNumber])

  const offerErrorMessage = getOfferErrorMessage({
    syntheticOffer,
    solanaBalance,
    offerSize,
    loanValue: loanValueNumber,
    loansAmount: loansAmountNumber,
    deltaValue: deltaValueNumber,
    hasFormChanges,
  })

  useEffect(() => {
    if (!!solanaBalance && !isEditMode && connected && !isEmpty(market)) {
      const bestLoanValue = calculateBestLoanValue(solanaBalance, market.bestOffer)

      onLoanValueChange(formatDecimal(bestLoanValue))
    }
  }, [market, isEditMode, connected, solanaBalance, syntheticOffer, onLoanValueChange])

  return {
    marketPreview: market,
    optimisticOffer: offer,

    loanValue,
    loansAmount,
    deltaValue,
    offerSize,

    onDeltaValueChange: isProMode ? onDeltaValueChange : undefined,
    onLoanValueChange,
    onLoanAmountChange,

    offerErrorMessage,
    hasFormChanges,
    isEditMode,

    exitEditMode,
    onCreateOffer,
    onRemoveOffer,
    onUpdateOffer,
  }
}

const useSyntheticOffer = (offerPubkey: string, marketPubkey: string) => {
  const { publicKey: walletPubkey } = useWallet()

  const { findOfferByPubkey, setOffer: setSyntheticOffer, removeOffer } = useSyntheticOffers()

  const syntheticOffer = useMemo(() => {
    return (
      findOfferByPubkey(offerPubkey) ||
      createEmptySyntheticOffer({ marketPubkey, walletPubkey: walletPubkey?.toBase58() || '' })
    )
  }, [findOfferByPubkey, marketPubkey, walletPubkey, offerPubkey])

  const removeSyntheticOffer = () => {
    removeOffer(syntheticOffer.marketPubkey)
  }

  return { syntheticOffer, removeSyntheticOffer, setSyntheticOffer }
}

const useMarketAndOffer = (offerPubkey: string, marketPubkey: string) => {
  const { marketsPreview } = useMarketsPreview()

  const market = useMemo(() => {
    return marketsPreview.find((market) => market.marketPubkey === marketPubkey)
  }, [marketPubkey, marketsPreview])

  const { offers, updateOrAddOffer } = useMarketOffers({ marketPubkey })

  const offer = useMemo(() => {
    return offers.find((offer) => offer.publicKey === offerPubkey)
  }, [offers, offerPubkey])

  return {
    offer,
    market,
    updateOrAddOffer,
  }
}
