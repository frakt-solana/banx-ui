import { FC } from 'react'

import { Button } from '@banx/components/Buttons'

import { TableUserOfferData } from '../helpers'

import styles from '../PendingOffersTable.module.less'

interface ActionsCellProps {
  offer: TableUserOfferData
}

export const ActionsCell: FC<ActionsCellProps> = () => {
  return (
    <div className={styles.actionsButtons}>
      <Button variant="secondary" size="small">
        Edit
      </Button>
      <Button className={styles.removeButton} variant="secondary" size="small">
        Remove
      </Button>
    </div>
  )
}
