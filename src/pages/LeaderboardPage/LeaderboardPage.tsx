import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import BanxRewardsTab from './components/BanxRewardsTab'
import EarnTab from './components/EarnTab'
import Header from './components/LeaderboardHeader'
import LeaderboardTab from './components/LeaderboardTab'
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
      <Tabs className={styles.tabs} value={currentTabValue} {...tabsProps} />
      {currentTabValue === LeaderboardTabName.REWARDS && <RewardsTab />}
      {currentTabValue === LeaderboardTabName.LEADERBOARD && <LeaderboardTab />}
      {currentTabValue === LeaderboardTabName.EARN && <EarnTab />}
      {currentTabValue === LeaderboardTabName.BAND_REWARDS && <BanxRewardsTab />}
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
