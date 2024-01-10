import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import EmptyList from '@banx/components/EmptyList'

import { formatNumbersWithCommas } from '@banx/utils'

import { useSeasonUserRewards } from '../../hooks'
import AnybodiesImg from './assets/Anybodies.png'
import BanxImg from './assets/Banx.png'

import styles from './RewardsTab.module.less'

const RewardsTab = () => {
  const { data } = useSeasonUserRewards()

  const { available = 0, redeemed = 0, totalAccumulated = 0 } = data?.bonkRewards || {}

  return (
    <div className={styles.container}>
      <ClaimRewardsBlock totalWeekRewards={totalAccumulated} />
      <AvailableToClaim availableToClaim={available} totalClaimed={redeemed} />
    </div>
  )
}

export default RewardsTab

interface ClaimRewardsBlockProps {
  totalWeekRewards: number
}

const ClaimRewardsBlock: FC<ClaimRewardsBlockProps> = ({ totalWeekRewards }) => {
  return (
    <div className={styles.weeklyRewardsBlock}>
      <div className={styles.weeklyRewardsInfo}>
        <p className={styles.blockTitle}>This week bounty</p>
        <p className={styles.rewardsValue}>{formatNumber(totalWeekRewards)} BONK</p>
      </div>
      <div className={styles.partnersInfoWrapper}>
        <p className={styles.blockTitle}>Powered by</p>
        <div className={styles.partnersImages}>
          <img src={BanxImg} alt="Banx" />
          <img src={AnybodiesImg} alt="Anybodies" />
        </div>
      </div>
    </div>
  )
}
interface AvailableToClaimProps {
  availableToClaim: number
  totalClaimed: number
}

const AvailableToClaim: FC<AvailableToClaimProps> = ({ availableToClaim, totalClaimed }) => {
  const { connected } = useWallet()

  return (
    <div className={styles.availableToClaim}>
      <div className={styles.availableToClaimInfo}>
        <p className={styles.blockTitle}>Available to claim</p>
        <p className={styles.rewardsValue}>{formatNumber(availableToClaim)} BONK</p>
      </div>
      <div className={styles.totalClaimedInfo}>
        <p className={styles.totalClaimedLabel}>Claimed to date:</p>
        <p className={styles.totalClaimedValue}>{formatNumber(totalClaimed)} BONK</p>
      </div>
      {connected ? (
        <Button className={styles.claimButton}>Claim</Button>
      ) : (
        <EmptyList className={styles.emptyList} message="Connect wallet to see claimable" />
      )}
    </div>
  )
}

const formatNumber = (value = 0) => {
  if (!value) return '--'

  return formatNumbersWithCommas(value)
}
