import { FC, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { MarketPreview } from '@banx/api/core'
import { SyntheticOffer, createEmptySyntheticOffer, useSyntheticOffers } from '@banx/store'

import { useMarketsPreview } from '../../hooks'
import { OFFER_MODE, OrderBookMarketParams } from '../ExpandableCardContent'
import PlaceLiteOffer from './PlaceLiteOffer'
import PlaceProOffer from './PlaceProOffer'
import { OfferHeader, SwitchModeButtons } from './components'

import styles from './PlaceOfferTab.module.less'

const PlaceOfferTab: FC<OrderBookMarketParams> = (props) => {
  const { ...offerParams } = usePlaceOffer(props)

  const { offerPubkey, onChangeOfferMode, exitEditMode, offerMode } = offerParams

  const isEditMode = !!offerPubkey

  return (
    <div className={styles.content}>
      <OfferHeader isEditMode={isEditMode} exitEditMode={exitEditMode} />
      <SwitchModeButtons mode={offerMode} onChange={onChangeOfferMode} />
      {offerMode === OFFER_MODE.LITE && <PlaceLiteOffer {...props} />}
      {offerMode === OFFER_MODE.PRO && <PlaceProOffer {...offerParams} />}
    </div>
  )
}

export default PlaceOfferTab

export interface OfferParams {
  offerPubkey: string
  marketPreview: MarketPreview | undefined
  syntheticOffer: SyntheticOffer

  exitEditMode: () => void
  onChangeOfferMode: (value: OFFER_MODE) => void
  setSyntheticOffer: (offer: SyntheticOffer) => void
}

type UsePlaceOffer = (props: OrderBookMarketParams) => OfferParams & { offerMode: OFFER_MODE }

const usePlaceOffer: UsePlaceOffer = (props) => {
  const { publicKey: walletPubkey } = useWallet()

  const { offerMode, marketPubkey, onChangeOfferMode, setOfferPubkey, offerPubkey } = props || {}

  const {
    findOfferByPubkey: findSyntheticOfferByPubkey,
    setOffer: setSyntheticOffer,
    removeOffer: removeSyntheticOffer,
  } = useSyntheticOffers()

  const syntheticOffer = useMemo(() => {
    return (
      findSyntheticOfferByPubkey(offerPubkey) ||
      createEmptySyntheticOffer({ marketPubkey, walletPubkey: walletPubkey?.toBase58() || '' })
    )
  }, [findSyntheticOfferByPubkey, marketPubkey, walletPubkey, offerPubkey])

  const exitEditMode = () => {
    setOfferPubkey('')
    removeSyntheticOffer(syntheticOffer.marketPubkey)
  }

  const { marketsPreview } = useMarketsPreview()
  const marketPreview = useMemo(() => {
    return marketsPreview.find((market) => market.marketPubkey === marketPubkey)
  }, [marketPubkey, marketsPreview])

  return {
    offerMode,

    offerPubkey,
    marketPreview,

    syntheticOffer,
    setSyntheticOffer,

    exitEditMode,
    onChangeOfferMode,
  }
}
