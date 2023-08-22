import { FC } from 'react'

import { Button } from '@banx/components/Buttons'

import styles from '../ActiveOffersTable.module.less'

export const ActionsCell: FC = () => {
  return (
    <div className={styles.actionsButtons}>
      <Button variant="secondary" size="small">
        Terminate
      </Button>
      <Button className={styles.removeButton} variant="secondary" size="small">
        Instant
      </Button>
    </div>
  )
}

export default ActionsCell
