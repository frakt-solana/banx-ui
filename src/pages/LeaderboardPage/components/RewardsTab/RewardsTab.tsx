import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import EmptyList from '@banx/components/EmptyList'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import Timer from '@banx/components/Timer'

import { Borrow, CircleCheck, Lend } from '@banx/icons'

import styles from './RewardsTab.module.less'

// TODO: need to remove it after it is added to BE
const MOCK_TOTAL_CLAIMED = 0
const MOCK_NEXT_WEEKLY_REWARDS = 1698105600

const RewardsTab = () => {
  return (
    <div className={styles.container}>
      <ClaimRewardsBlock
        totalClaimed={MOCK_TOTAL_CLAIMED}
        nextWeeklyRewards={MOCK_NEXT_WEEKLY_REWARDS}
      />
      <RewardsInfoBlock />
    </div>
  )
}

export default RewardsTab

interface ClaimRewardsBlockProps {
  totalClaimed: number
  nextWeeklyRewards: number
}

const ClaimRewardsBlock: FC<ClaimRewardsBlockProps> = ({ totalClaimed, nextWeeklyRewards }) => {
  const { connected } = useWallet()

  return (
    <div className={styles.claimRewardsBlock}>
      <StatInfo
        label="Total claimed"
        value={totalClaimed}
        classNamesProps={{ label: styles.claimRewardsLabel }}
        flexType="row"
      />
      <StatInfo
        label="Next weekly rewards in"
        value={<Timer expiredAt={nextWeeklyRewards} />}
        valueType={VALUES_TYPES.STRING}
        classNamesProps={{ label: styles.claimRewardsLabel }}
        flexType="row"
      />
      {!connected && (
        <EmptyList className={styles.emptyList} message="Connect wallet to see your rewards" />
      )}
    </div>
  )
}

const RewardsInfoBlock = () => (
  <div className={styles.rewardsInfoBlock}>
    <div className={styles.rewardsInfo}>
      <span className={styles.rewardsInfoTitle}>
        <Lend /> Lender
      </span>
      <div className={styles.infoRow}>
        <CircleCheck />
        <span> earn SOL APY while your competitive offers are pending in the orders books</span>
      </div>
      <div className={styles.infoRow}>
        <CircleCheck />
        <span>earn extra SOL APY for your active loans</span>
      </div>
    </div>
    <div className={styles.rewardsInfo}>
      <span className={styles.rewardsInfoTitle}>
        <Borrow /> Borrowers
      </span>
      <div className={styles.infoRow}>
        <CircleCheck />
        <span>earn SOL cashbacks for each loan you take</span>
      </div>
    </div>
  </div>
)
