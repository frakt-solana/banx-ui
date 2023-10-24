import { FC, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import EmptyList from '@banx/components/EmptyList'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import Timer from '@banx/components/Timer'

import { Borrow, CircleCheck, Lend } from '@banx/icons'

import { useLeaderboardUserStats } from '../../hooks'

import styles from './RewardsTab.module.less'

// TODO: need to remove it after it is added to BE
const MOCK_NEXT_WEEKLY_REWARDS = 1698710400

const RewardsTab = () => {
  const { publicKey: walletPublicKey } = useWallet()
  const walletPublicKeyString = walletPublicKey?.toBase58() || ''

  const { data: userStats } = useLeaderboardUserStats()

  const userTotalClaimed = useMemo(() => {
    const currentUser = userStats?.find((user) => user.user === walletPublicKeyString)

    if (currentUser) return parseFloat(currentUser.Sol)

    return 0
  }, [userStats, walletPublicKeyString])

  return (
    <div className={styles.container}>
      <ClaimRewardsBlock
        totalClaimed={userTotalClaimed}
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
        label="Total received"
        value={totalClaimed}
        classNamesProps={{ label: styles.claimRewardsLabel }}
        tooltipText="Your weekly SOL rewards will be airdropped to your wallet on a random time each Friday"
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
      {/* <div className={styles.infoRow}>
        <CircleCheck />
        <span> earn SOL APY while your competitive offers are pending in the orders books</span>
      </div> */}
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
