import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { isEmpty } from 'lodash'

import { useMarketOffers, useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { createEmptySyntheticOffer, useSyntheticOffers } from '@banx/store'
import { useSolanaBalance } from '@banx/utils'

import { OrderBookMarketParams } from '../../../ExpandableCardContent'
import {
  calcLoanToValuePercentage,
  calculateBestLoanValue,
  shouldShowDepositError,
} from '../helpers'
import { useOfferFormController } from './useOfferFormController'
import { useOfferTransactions } from './useOfferTransactions'

export const usePlaceOfferTab = (props: OrderBookMarketParams) => {
  const { marketPubkey, offerPubkey, setOfferPubkey } = props

  const { offers, updateOrAddOffer } = useMarketOffers({ marketPubkey })
  const { marketsPreview } = useMarketsPreview()
  const solanaBalance = useSolanaBalance()

  const {
    findOfferByPubkey: findSyntheticOfferByPubkey,
    setOffer: setSyntheticOffer,
    removeOffer: removeSyntheticOffer,
  } = useSyntheticOffers()

  const { connected } = useWallet()
  const { publicKey: walletPubkey } = useWallet()

  const marketPreview = marketsPreview.find((market) => market.marketPubkey === marketPubkey)

  const syntheticOffer = useMemo(() => {
    return (
      findSyntheticOfferByPubkey(offerPubkey) ||
      createEmptySyntheticOffer({ marketPubkey, walletPubkey: walletPubkey?.toBase58() || '' })
    )
  }, [findSyntheticOfferByPubkey, marketPubkey, walletPubkey, offerPubkey])

  const {
    loanValue,
    loansAmount,
    onLoanValueChange,
    onLoanAmountChange,
    hasFormChanges,
    resetFormValues,
  } = useOfferFormController(syntheticOffer?.loanValue / 1e9, syntheticOffer?.loansAmount)

  const loanValueNumber = parseFloat(loanValue)
  const loansAmountNumber = parseFloat(loansAmount)

  useEffect(() => {
    const hasSolanaBalance = !!solanaBalance
    const isNotEditMode = !syntheticOffer.isEdit

    if (hasSolanaBalance && isNotEditMode && connected && !isEmpty(marketPreview)) {
      const bestLoanValue = calculateBestLoanValue(solanaBalance, marketPreview.bestOffer)

      onLoanValueChange(bestLoanValue)
    }
  }, [marketPreview, connected, solanaBalance, syntheticOffer, onLoanValueChange])

  useEffect(() => {
    if (loansAmountNumber || loanValueNumber) {
      if (!syntheticOffer) return

      setSyntheticOffer({
        ...syntheticOffer,
        loanValue: loanValueNumber * 1e9,
        loansAmount: loansAmountNumber,
      })
    }
  }, [loansAmountNumber, loanValueNumber, syntheticOffer, setSyntheticOffer])

  const exitEditMode = () => {
    setOfferPubkey('')
    removeSyntheticOffer(syntheticOffer.marketPubkey)
  }

  const { onCreateOffer, onRemoveOffer, onUpdateOffer } = useOfferTransactions({
    marketPubkey,
    offerPubkey,
    loanValue: loanValueNumber,
    loansAmount: loansAmountNumber,
    offers,
    updateOrAddOffer,
    resetFormValues,
    exitEditMode,
  })

  const offerSize = loanValueNumber * loansAmountNumber || 0

  const showDepositError = shouldShowDepositError({
    initialLoansAmount: syntheticOffer.loansAmount,
    initialLoanValue: syntheticOffer.loanValue / 1e9,
    solanaBalance,
    offerSize,
  })

  const showBorrowerMessage = !showDepositError && !!offerSize

  const disablePlaceOffer = connected ? showDepositError || !offerSize : false
  const disableUpdateOffer = !hasFormChanges || showDepositError || !offerSize

  const loanToValuePercent = calcLoanToValuePercentage(loanValue, marketPreview)

  return {
    isEditMode: syntheticOffer.isEdit,
    offerSize,
    loanToValuePercent,
    marketApr: marketPreview?.marketApr || 0,
    loanValue,
    loansAmount,

    onLoanValueChange,
    onLoanAmountChange,

    showDepositError: showDepositError && connected,
    showBorrowerMessage,

    disableUpdateOffer,
    disablePlaceOffer,

    offerTransactions: {
      onCreateOffer,
      onRemoveOffer,
      onUpdateOffer,
    },
  }
}
