import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import { Plug } from './assets'
import EarnTab from './components/EarnTab'
import Header from './components/LeaderboardHeader'
import ReferralTab from './components/ReferralTab'
// import LeaderboardTab from './components/LeaderboardTab'
import RewardsTab from './components/RewardsTab'

import styles from './LeaderboardPage.module.less'

export enum LeaderboardTabName {
  REWARDS = 'rewards',
  LEADERBOARD = 'leaderboard',
  EARN = 'earn',
  REFERRAL = 'referral',
}

export const LeaderboardPage = () => {
  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: LEADERBOARD_TABS,
    defaultValue: LeaderboardTabName.REFERRAL,
  })

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <Tabs className={styles.tabs} value={currentTabValue} {...tabsProps} />
      {currentTabValue === LeaderboardTabName.REFERRAL && <ReferralTab />}
      {currentTabValue === LeaderboardTabName.REWARDS && <RewardsTab />}
      {/* {currentTabValue === LeaderboardTabName.LEADERBOARD && <LeaderboardTab />} */}
      {currentTabValue === LeaderboardTabName.LEADERBOARD && <LeaderboardPlug />}
      {currentTabValue === LeaderboardTabName.EARN && <EarnTab />}
    </div>
  )
}

const LeaderboardPlug = () => {
  return (
    <div className={styles.leaderboardPlug}>
      <Plug />
      <h4>Season 3 coming soon</h4>
    </div>
  )
}

export const LEADERBOARD_TABS: Tab[] = [
  {
    label: 'Referrals',
    value: LeaderboardTabName.REFERRAL,
  },
  {
    label: 'BONK rewards',
    value: LeaderboardTabName.REWARDS,
  },
  {
    label: 'Leaderboard',
    value: LeaderboardTabName.LEADERBOARD,
  },
  {
    label: 'Earn points',
    value: LeaderboardTabName.EARN,
  },
]
