import { FC } from 'react'

import { Button } from '@banx/components/Buttons'

import { BanxToken, Cashback } from '@banx/icons'

import styles from '../ReferralTab.module.less'

interface ReferralInfoSectionProps {
  rewardsValue: number
}

export const ReferralInfoSection: FC<ReferralInfoSectionProps> = ({ rewardsValue }) => {
  return (
    <div className={styles.referralInfoSection}>
      <div className={styles.referralInfoContent}>
        <div className={styles.referralInfoRow}>
          <Cashback />
          <span>For the first loan you will receive a 100% cashback in $BANX</span>
        </div>
        <div className={styles.referralInfoRow}>
          <Cashback />
          <span>You will receive 10% every time your referral pays upfront fee</span>
        </div>
      </div>

      <div className={styles.rewardsInfo}>
        <div className={styles.rewardsStatInfo}>
          <span className={styles.rewardsStatLabel}>Rewards</span>
          <div className={styles.rewardsStatValue}>
            <span>{rewardsValue}</span>
            <BanxToken />
          </div>
        </div>
        <Button className={styles.claimRewardsButton}>Claim</Button>
      </div>
    </div>
  )
}
