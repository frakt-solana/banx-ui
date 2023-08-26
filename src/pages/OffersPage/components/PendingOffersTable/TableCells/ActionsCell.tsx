import { FC, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'

import { Offer } from '@banx/api/core'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import { makeRemoveOfferAction } from '@banx/transactions/bonds'

import { TableUserOfferData } from '../helpers'
import { useUserOffers } from '../hooks'

import styles from '../PendingOffersTable.module.less'

interface ActionsCellProps {
  offer: TableUserOfferData
}

export const ActionsCell: FC<ActionsCellProps> = ({ offer }) => {
  const { removeOffer } = useActionsCell(offer)

  return (
    <div className={styles.actionsButtons}>
      <Button variant="secondary" size="small">
        Edit
      </Button>
      <Button
        onClick={removeOffer}
        className={styles.removeButton}
        variant="secondary"
        size="small"
      >
        Remove
      </Button>
    </div>
  )
}

const useActionsCell = (offer: TableUserOfferData) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { offers } = useUserOffers()

  const offerPubkey = offer.publicKey

  const optimisticOffer = useMemo(() => {
    return offers.find((offer) => offer.publicKey === offerPubkey)
  }, [offers, offerPubkey])

  const removeOffer = () => {
    new TxnExecutor(makeRemoveOfferAction, { wallet, connection })
      .addTxnParam({ offerPubkey: offer.publicKey, optimisticOffer: optimisticOffer as Offer })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error)
      })
      .execute()
  }

  return { removeOffer }
}
