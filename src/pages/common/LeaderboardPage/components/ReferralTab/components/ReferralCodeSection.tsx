import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import EmptyList from '@banx/components/EmptyList'
import RefferralModal, { ReferralInput } from '@banx/components/RefferralModal'

import { DISCORD } from '@banx/constants'
import { Copy } from '@banx/icons'
import { useModal } from '@banx/store/common'
import { copyToClipboard } from '@banx/utils'

import { useRefPersonalData } from '../hooks'

import styles from '../ReferralTab.module.less'

export const ReferralCodeSection = () => {
  const { connected } = useWallet()
  const { open } = useModal()

  const { data } = useRefPersonalData()

  const { refCode = '', refUsers = [] } = data || {}

  const totalReferred = refUsers.length || 0

  const displayReferredValue = connected ? totalReferred : EmptyValueJSX

  const showModal = () => {
    open(RefferralModal, {})
  }

  return (
    <div className={styles.referralCodeSection}>
      {!connected && (
        <EmptyList
          className={styles.referralCodeEmptyList}
          message="Connect wallet to see claimable and ref info"
        />
      )}

      {connected && (
        <>
          <ReferralInput
            label="Your referral code"
            value={refCode}
            actionButton={{ text: 'Copy', icon: Copy, onClick: () => copyToClipboard(refCode) }}
          />

          <CustomReferralLink />
        </>
      )}

      <div className={styles.referralInviteInfo}>
        <div className={styles.invitedStat}>
          <span className={styles.invitedLabel}>Invited by</span>

          {connected && (
            <Button onClick={showModal} size="small" variant="secondary">
              Add referrer
            </Button>
          )}

          {!connected && EmptyValueJSX}
        </div>

        <div className={styles.referredStat}>
          <span className={styles.referredLabel}>You referred</span>
          <span className={styles.referredValue}>{displayReferredValue}</span>
        </div>
      </div>
    </div>
  )
}

const EmptyValueJSX = <>--</>

const CustomReferralLink = () => (
  <div className={styles.customReferralLink}>
    Custom link is available to you, please join{' '}
    <a href={DISCORD.SERVER_URL} rel="noopener noreferrer" target="_blank">
      our discord
    </a>{' '}
    and create ticket
  </div>
)
