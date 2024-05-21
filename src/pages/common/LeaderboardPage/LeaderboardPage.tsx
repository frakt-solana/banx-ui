import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import { Plug } from './assets'
import EarnTab from './components/EarnTab'
import Header from './components/LeaderboardHeader'
// import LeaderboardTab from './components/LeaderboardTab'
import RewardsTab from './components/RewardsTab'

import styles from './LeaderboardPage.module.less'

export enum LeaderboardTabName {
  REWARDS = 'rewards',
  LEADERBOARD = 'leaderboard',
  EARN = 'earn',
}

export const LeaderboardPage = () => {
  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: LEADERBOARD_TABS,
    defaultValue: LEADERBOARD_TABS[1].value,
  })

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <Tabs className={styles.tabs} value={currentTabValue} {...tabsProps} />
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
