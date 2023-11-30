import { useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useNavigate } from 'react-router-dom'
import { TxnExecutor } from 'solana-transactions-executor'

import { CollectionMeta, Offer } from '@banx/api/core'
import { useLenderLoansAndOffers } from '@banx/pages/OffersPage/hooks'
import { PATHS } from '@banx/router'
import { useMarketsURLControl, useSyntheticOffers } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { makeRemoveOfferAction } from '@banx/transactions/bonds'
import { enqueueSnackbar } from '@banx/utils'

export const useActionsCell = (offer: Offer, collectionMeta: CollectionMeta) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { data, updateOrAddOffer } = useLenderLoansAndOffers()
  const offers = data.map(({ offer }) => offer)

  const navigate = useNavigate()

  const { setSelectedMarkets, setMarketVisibility } = useMarketsURLControl()

  const { setOffer: setSyntheticOffer, removeOffer: removeSyntheticOffer } = useSyntheticOffers()

  const offerPubkey = offer.publicKey

  const optimisticOffer = useMemo(() => {
    return offers.find((offer) => offer.publicKey === offerPubkey)
  }, [offers, offerPubkey])

  const goToEditOffer = () => {
    setSyntheticOffer({
      isEdit: true,
      publicKey: offer.publicKey,
      loanValue: offer.currentSpotPrice,
      loansAmount: offer.buyOrdersQuantity,
      assetReceiver: offer.assetReceiver,
      marketPubkey: offer.hadoMarket,
      mathCounter: offer.mathCounter,
      deltaValue: offer.bondingCurve.delta,
    })

    const collectionName = collectionMeta.collectionName

    setMarketVisibility(collectionName, true)
    setSelectedMarkets([collectionName])

    return navigate({
      pathname: PATHS.LEND,
      search: `?opened=${collectionName}&collections=${collectionName}`,
    })
  }

  const removeOffer = () => {
    const txnParam = { optimisticOffer: optimisticOffer as Offer }

    new TxnExecutor(makeRemoveOfferAction, { wallet, connection })
      .addTxnParam(txnParam)
      .on('pfSuccessEach', (results) => {
        const { txnHash, result } = results[0]
        if (result?.bondOffer) {
          updateOrAddOffer([result.bondOffer])
          removeSyntheticOffer(result?.bondOffer.hadoMarket)
        }
        enqueueSnackbar({
          message: 'Offer successfully removed',
          type: 'success',
          solanaExplorerPath: `tx/${txnHash}`,
        })
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: txnParam,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'RemoveOffer',
        })
      })
      .execute()
  }

  return { removeOffer, goToEditOffer }
}
