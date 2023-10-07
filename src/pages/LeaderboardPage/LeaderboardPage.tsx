import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import Header from './components/Header'
import RewardsTab from './components/RewardsTab'

import styles from './LeaderboardPage.module.less'

export enum LeaderboardTabName {
  REWARDS = 'rewards',
  LEADERBOARD = 'leaderboard',
  EARN = 'earn',
  BAND_REWARDS = 'banxRewards',
}

export const LeaderboardPage = () => {
  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: LEADERBOARD_TABS,
    defaultValue: LEADERBOARD_TABS[0].value,
  })

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <Tabs value={currentTabValue} {...tabsProps} />
      {currentTabValue === LeaderboardTabName.REWARDS && <RewardsTab />}
      {currentTabValue === LeaderboardTabName.LEADERBOARD && <></>}
      {currentTabValue === LeaderboardTabName.EARN && <></>}
    </div>
  )
}

export const LEADERBOARD_TABS: Tab[] = [
  {
    label: 'SOL rewards',
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
  {
    label: 'Banx rewards',
    value: LeaderboardTabName.BAND_REWARDS,
  },
]
