import { useWallet } from '@solana/wallet-adapter-react'
import { Skeleton } from 'antd'

import { Button } from '@banx/components/Buttons'
import EmptyList from '@banx/components/EmptyList'
import RefferralModal, { ReferralInput } from '@banx/components/RefferralModal'

import { BASE_BANX_URL, DISCORD } from '@banx/constants'
import { Copy } from '@banx/icons'
import { useModal } from '@banx/store/common'
import { copyToClipboard, enqueueSnackbar } from '@banx/utils'

import { useRefPersonalData } from '../hooks'

import styles from '../ReferralTab.module.less'

export const ReferralCodeSection = () => {
  const { connected } = useWallet()
  const { open } = useModal()

  const { data, isLoading } = useRefPersonalData()

  const { refCode = '', refUsers = [], referredBy = '' } = data || {}

  const totalReferred = refUsers.length || 0

  const displayReferredValue = connected ? totalReferred : EmptyValueJSX

  const showModal = () => {
    open(RefferralModal, {})
  }

  const handleCopyRefCode = () => {
    const textToCopy = `${BASE_BANX_URL}ref=${refCode}`
    copyToClipboard(textToCopy)

    enqueueSnackbar({ message: 'Copied your referral link', type: 'success' })
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
            actionButton={{ text: 'Copy', icon: Copy, onClick: handleCopyRefCode }}
            className={styles.referralInput}
          />

          <CustomReferralLink />
        </>
      )}

      {isLoading && <Skeleton.Input className={styles.referralInviteInfoSkeleton} />}

      {!isLoading && (
        <div className={styles.referralInviteInfo}>
          <div className={styles.invitedStat}>
            <span className={styles.invitedLabel}>Invited by</span>

            {connected && !referredBy && (
              <Button onClick={showModal} size="small" variant="secondary">
                Add referrer
              </Button>
            )}

            {connected && !!referredBy && (
              <span className={styles.referredValue}>{referredBy.slice(0, 4)}</span>
            )}

            {!connected && EmptyValueJSX}
          </div>

          <div className={styles.referredStat}>
            <span className={styles.referredLabel}>You referred</span>
            <span className={styles.referredValue}>{displayReferredValue}</span>
          </div>
        </div>
      )}
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
