import { FC, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useNavigate } from 'react-router-dom'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'

import { Offer } from '@banx/api/core'
import { useUserOffers } from '@banx/pages/OffersPage/hooks'
import { PATHS } from '@banx/router'
import { useMarketsURLControl, useSyntheticOffers } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { makeRemoveOfferAction } from '@banx/transactions/bonds'
import { enqueueSnackbar, trackPageEvent } from '@banx/utils'

import { TableUserOfferData } from '../helpers'

import styles from '../PendingOffersTable.module.less'

interface ActionsCellProps {
  offer: TableUserOfferData
  isCardView: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ offer, isCardView }) => {
  const { removeOffer, goToEditOffer } = useActionsCell(offer)

  const buttonSize = isCardView ? 'medium' : 'small'

  const onEdit = () => {
    goToEditOffer()
    trackPageEvent('myoffers', 'pendingtab-edit')
  }

  const onRemove = () => {
    removeOffer()
    trackPageEvent('myoffers', 'pendingtab-remove')
  }

  return (
    <div className={styles.actionsButtons}>
      <Button
        className={styles.actionButton}
        onClick={onEdit}
        variant="secondary"
        size={buttonSize}
      >
        Edit
      </Button>
      <Button
        className={styles.removeButton}
        onClick={onRemove}
        variant="secondary"
        size={buttonSize}
      >
        Remove
      </Button>
    </div>
  )
}

const useActionsCell = (offer: TableUserOfferData) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { offers, updateOrAddOffer } = useUserOffers()

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
      loanValue: offer.loanValue,
      loansAmount: offer.loansAmount,
      assetReceiver: offer.assetReceiver,
      marketPubkey: offer.hadoMarket,
    })

    const collectionName = offer.collectionName

    setMarketVisibility(collectionName, true)
    setSelectedMarkets([collectionName])

    return navigate({
      pathname: PATHS.LEND,
      search: `?opened=${collectionName}&collections=${collectionName}`,
    })
  }

  const removeOffer = () => {
    const txnParam = { offerPubkey: offer.publicKey, optimisticOffer: optimisticOffer as Offer }

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
