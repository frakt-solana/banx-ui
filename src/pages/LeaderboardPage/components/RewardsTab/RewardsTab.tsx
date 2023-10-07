import { FC } from 'react'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { Borrow, Lend, MoneyBill } from '@banx/icons'

import styles from './RewardsTab.module.less'

const MOCK_TOTAL_CLAIMED = 350
const MOCK_NEXT_WEEKLY_REWARDS = '06d : 23h : 15m'
const MOCK_AVAILABLE_TO_CLAIM = 10

const RewardsTab = () => {
  return (
    <div className={styles.container}>
      <ClaimRewardsBlock
        totalClaimed={MOCK_TOTAL_CLAIMED}
        nextWeeklyRewards={MOCK_NEXT_WEEKLY_REWARDS}
        availableToClaim={MOCK_AVAILABLE_TO_CLAIM}
      />
      <RewardsInfoBlock />
    </div>
  )
}

export default RewardsTab

interface ClaimRewardsBlockProps {
  totalClaimed: number
  nextWeeklyRewards: string
  availableToClaim: number
}

const ClaimRewardsBlock: FC<ClaimRewardsBlockProps> = ({
  totalClaimed,
  nextWeeklyRewards,
  availableToClaim,
}) => {
  return (
    <div className={styles.claimRewardsBlock}>
      <StatInfo label="Total claimed" value={totalClaimed} flexType="row" />
      <StatInfo
        label="Next weekly rewards in"
        value={nextWeeklyRewards}
        valueType={VALUES_TYPES.STRING}
        flexType="row"
      />
      <div className={styles.avaiableToClaimInfo}>
        <div className={styles.moneyBillIconWrapper}>
          <MoneyBill />
        </div>
        <StatInfo
          value={availableToClaim}
          label="Available to claim"
          classNamesProps={{
            container: styles.stat,
            value: styles.value,
            label: styles.label,
          }}
        />
      </div>
      <Button className={styles.claimRewardsButton}>Claim</Button>
    </div>
  )
}

const RewardsInfoBlock = () => {
  return (
    <div className={styles.rewardsInfoBlock}>
      <div className={styles.rewardsInfo}>
        <span className={styles.rewardsInfoTitle}>
          <Lend /> Lender
        </span>
        <span>earn SOL APY while your offers are pending in offer book</span>
        <span>earn extra SOL APY for your active loans</span>
      </div>
      <div className={styles.rewardsInfo}>
        <span className={styles.rewardsInfoTitle}>
          <Borrow /> Borrowers
        </span>
        <span>earn SOL cashbacks for each loan you take</span>
      </div>
    </div>
  )
}
