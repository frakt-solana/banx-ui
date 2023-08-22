import { FC } from 'react'

import { Button } from '@banx/components/Buttons'

import styles from '../PendingOffersTable.module.less'

interface ActionsCellProps {}

export const ActionsCell: FC = () => {
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

export default ActionsCell
