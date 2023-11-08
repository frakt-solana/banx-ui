import { FC, useEffect, useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import moment from 'moment'

import EmptyList from '@banx/components/EmptyList'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import Timer from '@banx/components/Timer'

import { Borrow, CircleCheck, Lend } from '@banx/icons'

import { useLeaderboardUserStats } from '../../hooks'
import { calculateNextTuesdayAtUTC, isTuesdayAndMidnight } from './helpers'

import styles from './RewardsTab.module.less'

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
      <ClaimRewardsBlock totalClaimed={userTotalClaimed} />
      <RewardsInfoBlock />
    </div>
  )
}

export default RewardsTab

interface ClaimRewardsBlockProps {
  totalClaimed: number
}

const ClaimRewardsBlock: FC<ClaimRewardsBlockProps> = ({ totalClaimed }) => {
  const { connected } = useWallet()

  const [nextWeeklyRewards, setNextWeeklyRewards] = useState(calculateNextTuesdayAtUTC())

  const updateNextWeeklyRewards = () => {
    const newNextRewards = calculateNextTuesdayAtUTC()
    setNextWeeklyRewards(newNextRewards)
  }

  useEffect(() => {
    const timerInterval = setInterval(() => {
      const now = moment.utc()
      if (isTuesdayAndMidnight(now)) {
        updateNextWeeklyRewards()
      }
    }, 1000)

    return () => clearInterval(timerInterval)
  }, [])

  return (
    <div className={styles.claimRewardsBlock}>
      {connected && (
        <StatInfo
          label="Total received"
          value={totalClaimed}
          classNamesProps={{ label: styles.claimRewardsLabel }}
          tooltipText="Your weekly SOL rewards will be airdropped to your wallet on a random time each Monday"
          flexType="row"
        />
      )}
      <StatInfo
        label="Next weekly rewards in"
        value={<Timer expiredAt={nextWeeklyRewards.unix()} />}
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
