import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'

import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import { makeRemoveOfferAction } from '@banx/transactions/bonds'

import { TableUserOfferData } from '../helpers'

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

  const offerPubkey = offer.publicKey

  // const optimisticOffer = useMemo(() => {
  //   return offers.find((offer) => offer.publicKey === offerPubkey)
  // }, [offers, offerPubkey])

  const removeOffer = () => {
    new TxnExecutor(makeRemoveOfferAction, { wallet, connection })
      // .addTxnParam({ offerPubkey: offer.publicKey, optimisticOffer: optimisticOffer as any })
      // .on('pfSuccess', () => {
      //   updateOrAddOffer(optimisticOffer as any)
      // })
      .execute()
  }

  return { removeOffer }
}
