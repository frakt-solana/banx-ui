import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { useMarketOffers } from '@banx/pages/LendPage/hooks'
import { createEmptySyntheticOffer, useSyntheticOffers } from '@banx/store'

import { OrderBookMarketParams } from '../../../ExpandableCardContent'
import { useOfferFormController } from './useOfferFormController'
import { useOfferTransactions } from './useOfferTransactions'

export const usePlaceOfferTab = ({
  marketPubkey,
  offerPubkey,
  setOfferPubkey,
}: OrderBookMarketParams) => {
  const { offers, updateOrAddOffer } = useMarketOffers({ marketPubkey })

  const {
    findOfferByPubkey: findSyntheticOfferByPubkey,
    setOffer: setSyntheticOffer,
    removeOffer: removeSyntheticOffer,
  } = useSyntheticOffers()

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
    resetFormValues,
  } = useOfferFormController(syntheticOffer?.loanValue / 1e9, syntheticOffer?.loansAmount)

  const loanValueNumber = parseFloat(loanValue)
  const loansAmountNumber = parseFloat(loansAmount)
  const deltaValueNumber = parseFloat(deltaValue)

  const exitEditMode = () => {
    setOfferPubkey('')
    removeSyntheticOffer(syntheticOffer.marketPubkey)
  }

  const { onCreateOffer, onRemoveOffer, onUpdateOffer } = useOfferTransactions({
    marketPubkey,
    offerPubkey,
    loanValue: loanValueNumber,
    loansAmount: loansAmountNumber,
    deltaValue: deltaValueNumber,
    offers,
    updateOrAddOffer,
    resetFormValues,
    exitEditMode,
  })

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

    offerTransactions: {
      onCreateOffer,
      onRemoveOffer,
      onUpdateOffer,
    },
  }
}
