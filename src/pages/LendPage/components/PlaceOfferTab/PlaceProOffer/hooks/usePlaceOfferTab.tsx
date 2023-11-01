import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { createEmptySyntheticOffer, useSyntheticOffers } from '@banx/store'

import { OrderBookMarketParams } from '../../../ExpandableCardContent'
import { useOfferFormController } from './useOfferFormController'

export const usePlaceOfferTab = (props: OrderBookMarketParams) => {
  const { marketPubkey, offerPubkey } = props

  const { findOfferByPubkey: findSyntheticOfferByPubkey, setOffer: setSyntheticOffer } =
    useSyntheticOffers()

  const { publicKey: walletPubkey } = useWallet()

  const syntheticOffer = useMemo(() => {
    return (
      findSyntheticOfferByPubkey(offerPubkey) ||
      createEmptySyntheticOffer({ marketPubkey, walletPubkey: walletPubkey?.toBase58() || '' })
    )
  }, [findSyntheticOfferByPubkey, marketPubkey, walletPubkey, offerPubkey])

  const {
    loanValue,
    loansAmount,
    deltaValue,
    onDeltaValueChange,
    onLoanValueChange,
    onLoanAmountChange,
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

  return {
    isEditMode: syntheticOffer.isEdit,

    loanValue,
    loansAmount,
    deltaValue,

    onDeltaValueChange,
    onLoanValueChange,
    onLoanAmountChange,
  }
}
