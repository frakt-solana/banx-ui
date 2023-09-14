import { FC, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@banx/components/Buttons'

import { Offer } from '@banx/api/core'
import { useUserOffers } from '@banx/pages/OffersPage/hooks'
import { PATHS } from '@banx/router'
import { useMarketsURLControl } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import { makeRemoveOfferAction } from '@banx/transactions/bonds'
import { enqueueSnackbar } from '@banx/utils'

import { TableUserOfferData } from '../helpers'

import styles from '../PendingOffersTable.module.less'

interface ActionsCellProps {
  offer: TableUserOfferData
  isCardView: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ offer, isCardView }) => {
  const navigate = useNavigate()

  const { setSelectedMarkets, toggleMarketVisibility } = useMarketsURLControl()
  const { removeOffer } = useActionsCell(offer)

  const buttonSize = isCardView ? 'large' : 'small'

  const goToEditOffer = () => {
    const collectionName = offer.collectionName

    toggleMarketVisibility(collectionName)
    setSelectedMarkets([collectionName])

    return navigate({
      pathname: PATHS.LEND,
      search: `?opened=${collectionName}&collections=${collectionName}`,
    })
  }

  return (
    <div className={styles.actionsButtons}>
      <Button onClick={goToEditOffer} variant="secondary" size={buttonSize}>
        Edit
      </Button>
      <Button
        onClick={removeOffer}
        className={styles.removeButton}
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

  const offerPubkey = offer.publicKey

  const optimisticOffer = useMemo(() => {
    return offers.find((offer) => offer.publicKey === offerPubkey)
  }, [offers, offerPubkey])

  const removeOffer = () => {
    new TxnExecutor(makeRemoveOfferAction, { wallet, connection })
      .addTxnParam({ offerPubkey: offer.publicKey, optimisticOffer: optimisticOffer as Offer })
      .on('pfSuccessEach', (results) => {
        const { txnHash, result } = results[0]
        result?.bondOffer && updateOrAddOffer([result.bondOffer])
        enqueueSnackbar({
          message: 'Transaction Executed',
          solanaExplorerPath: `tx/${txnHash}`,
        })
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error)
      })
      .execute()
  }

  return { removeOffer }
}
