import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { useMarketOffers, useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { createEmptySyntheticOffer, useSyntheticOffers } from '@banx/store'
import { useSolanaBalance } from '@banx/utils'

import { OrderBookMarketParams } from '../../ExpandableCardContent'
import { shouldShowDepositError } from '../helpers'
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
    initialLoanValue: syntheticOffer.loanValue,
    solanaBalance,
    offerSize,
  })

  const disablePlaceOffer = connected ? showDepositError || !offerSize : false
  const disableUpdateOffer = !hasFormChanges || showDepositError || !offerSize

  return {
    isEditMode: syntheticOffer.isEdit,
    offerSize,
    marketApr: marketPreview?.marketApr || 0,
    loanValue,
    loansAmount,

    exitEditMode,
    onLoanValueChange,
    onLoanAmountChange,

    showDepositError: showDepositError && connected,

    disableUpdateOffer,
    disablePlaceOffer,

    offerTransactions: {
      onCreateOffer,
      onRemoveOffer,
      onUpdateOffer,
    },
  }
}
