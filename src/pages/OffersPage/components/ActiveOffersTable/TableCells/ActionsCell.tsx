import { FC } from 'react'

import { Button } from '@banx/components/Buttons'

import styles from '../ActiveOffersTable.module.less'

interface ActionsCellProps {
  isCardView: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ isCardView }) => {
  const buttonSize = isCardView ? 'large' : 'small'

  return (
    <div className={styles.actionsButtons}>
      <Button className={styles.terminateButton} variant="secondary" size={buttonSize}>
        Terminate
      </Button>
      <Button size={buttonSize} className={styles.instantButton} variant="secondary">
        Instant
      </Button>
    </div>
  )
}

export default ActionsCell
