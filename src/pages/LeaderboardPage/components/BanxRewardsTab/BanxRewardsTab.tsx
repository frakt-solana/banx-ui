// import { FC } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { useWallet } from '@solana/wallet-adapter-react'
import { NavLink } from 'react-router-dom'

import { Button } from '@banx/components/Buttons'
import EmptyList from '@banx/components/EmptyList/EmptyList'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { Theme, useTheme } from '@banx/hooks'
import {
  BanxRewardsDark as BanxRewardsDarkIcon,
  BanxRewards as BanxRewardsIcon,
  CircleCheck as CircleCheckIcon,
} from '@banx/icons'
import { PATHS } from '@banx/router'

// import { formatNumbersWithCommas } from '@banx/utils'
// import { useSeasonUserRewards } from '../../hooks'
import styles from './BanxRewardsTab.module.less'

const BanxRewardsTab = () => {
  const { connected } = useWallet()

  // const { data } = useSeasonUserRewards()
  // const { earlyIncentives = 0, firstSeasonRewards = 0, secondSeasonRewards = 0 } = data || {}

  const { theme } = useTheme()
  const Icon = theme === Theme.DARK ? BanxRewardsDarkIcon : BanxRewardsIcon

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <StatsBlock
        // earlyIncentives={earlyIncentives}
        // firstSeasonRewards={firstSeasonRewards}
        // secondSeasonRewards={secondSeasonRewards}
        />
        {!connected && (
          <EmptyList className={styles.emptyList} message="Connect wallet to see your rewards" />
        )}
        <InfoBlock />
      </div>
      <Icon className={styles.banxRewardsIcon} />
    </div>
  )
}

export default BanxRewardsTab

// interface StatsBlockProps {
//   earlyIncentives: number
//   firstSeasonRewards: number
//   secondSeasonRewards: number
// }

const StatsBlock /* : FC<StatsBlockProps> */ = (/*{
  earlyIncentives,
  firstSeasonRewards,
  secondSeasonRewards,
}*/) => {
  const statClassNames = {
    container: styles.statContainer,
    value: styles.statValue,
    label: styles.statLabel,
  }

  return (
    <div className={styles.stats}>
      <StatInfo
        label="Early incentives"
        value="? $BANX"
        // value={`${formatNumbersWithCommas(earlyIncentives)} $BANX`}
        classNamesProps={statClassNames}
        valueType={VALUES_TYPES.STRING}
        tooltipText="We converted the locked $FRKT rewards you received from past marketing campaigns to their equivalent amount of $BANX tokens"
      />
      <PlusOutlined />
      <StatInfo
        label="Leaderboard s1"
        value="? $BANX"
        // value={`${formatNumbersWithCommas(firstSeasonRewards)} $BANX`}
        classNamesProps={statClassNames}
        valueType={VALUES_TYPES.STRING}
      />
      <PlusOutlined />
      <StatInfo
        label="Leaderboard s2"
        value="? $BANX"
        // value={`${formatNumbersWithCommas(secondSeasonRewards)} $BANX`}
        classNamesProps={statClassNames}
        valueType={VALUES_TYPES.STRING}
      />
    </div>
  )
}

const InfoBlock = () => (
  <div className={styles.infoBlock}>
    {INFO_TEXTS.map((text, index) => (
      <div className={styles.infoRow} key={index}>
        <CircleCheckIcon />
        {text}
      </div>
    ))}
    <NavLink className={styles.actionButton} to={PATHS.ADVENTURES}>
      <Button>Stake Banx</Button>
    </NavLink>
  </div>
)

const INFO_TEXTS = [
  'You can boost your rewards by staking Banx NFTs',
  'More player points staked = higher boost',
  '$banx IDO will happen at the end of leaderboard S2',
  'At IDO, $banx rewards will start to unlock linearly over a year period',
]
