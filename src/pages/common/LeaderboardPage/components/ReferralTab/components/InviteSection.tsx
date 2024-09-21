import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import EmptyList from '@banx/components/EmptyList'
import RefferralModal from '@banx/components/RefferralModal'

import { CircleCheck } from '@banx/icons'
import { useModal } from '@banx/store/common'

import { useRefPersonalData } from '../hooks'

import styles from '../ReferralTab.module.less'

export const InviteSection = () => {
  const { connected } = useWallet()

  const { data } = useRefPersonalData()
  const { referredBy = '' } = data || {}

  return (
    <div className={classNames(styles.inviteSection, { [styles.notConnected]: !connected })}>
      {!connected && (
        <EmptyList
          className={styles.referralCodeEmptyList}
          message="Connect wallet to see claimable and ref info"
        />
      )}

      {connected && <InviteContent referredBy={referredBy} />}

      <div className={styles.inviteBenefits}>
        <div className={styles.inviteBenefit}>
          <CircleCheck />
          <span>50% upfront fee cashback + 2X points on first Borrow</span>
        </div>
        <div className={styles.inviteBenefit}>
          <CircleCheck />
          <span>4X points on first Lend</span>
        </div>
      </div>
    </div>
  )
}

const InviteContent: FC<{ referredBy: string }> = ({ referredBy }) => {
  const { open } = useModal()

  const showModal = () => {
    open(RefferralModal)
  }

  const createReferredValueJSX = () => {
    if (!referredBy)
      return (
        <Button onClick={showModal} size="medium" variant="secondary">
          Add referrer
        </Button>
      )

    //? Show shorten wallet address
    return referredBy.slice(0, 4)
  }

  return (
    <div className={styles.inviteInfo}>
      <span>You invited by</span>
      <span>{createReferredValueJSX()}</span>
    </div>
  )
}
