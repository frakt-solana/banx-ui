import classNames from 'classnames'
import { NavLink } from 'react-router-dom'

import { Button } from '@banx/components/Buttons'
import { PriorityFeesModal } from '@banx/components/modals'

import { Cup, Settings } from '@banx/icons'
import { PATHS } from '@banx/router'
import { useModal } from '@banx/store/common'

import { isActivePath } from '../Navbar/helpers'

import styles from './Header.module.less'

export const PriorityFeesButton = () => {
  const { open, close } = useModal()

  const onClickHandler = () => {
    open(PriorityFeesModal, { onCancel: close })
  }

  return (
    <Button
      type="circle"
      variant="tertiary"
      onClick={onClickHandler}
      className={styles.priorityFeeButton}
    >
      <Settings />
    </Button>
  )
}

export const RewardsButton = () => {
  return (
    <div className={styles.rewardsButtonWrapper}>
      <NavLink to={PATHS.LEADERBOARD}>
        <Button
          type="circle"
          variant="tertiary"
          className={classNames(styles.rewardsButton, {
            [styles.active]: isActivePath(PATHS.LEADERBOARD),
          })}
        >
          <Cup />
          <div className={styles.rewardsButtonText}>Farm $BANX</div>
        </Button>
      </NavLink>
    </div>
  )
}
