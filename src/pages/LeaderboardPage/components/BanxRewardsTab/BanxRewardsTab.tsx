import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { slice, sumBy } from 'lodash'
import moment from 'moment'
import { NavLink } from 'react-router-dom'

import { Button } from '@banx/components/Buttons'
import EmptyList from '@banx/components/EmptyList/EmptyList'
import { StatInfo, StatsInfoProps, VALUES_TYPES } from '@banx/components/StatInfo'
import Timer from '@banx/components/Timer'
import Tooltip from '@banx/components/Tooltip'
import { useFetchUserRewards } from '@banx/components/WalletModal'

import { LAUNCH_APP_URL } from '@banx/constants'
import { Theme, useTheme } from '@banx/hooks'
import {
  BanxRewardsDark as BanxRewardsDarkIcon,
  BanxRewards as BanxRewardsIcon,
  BanxToken as BanxTokenIcon,
  CircleCheck as CircleCheckIcon,
  Heart as HeartIcon,
} from '@banx/icons'
import { PATHS } from '@banx/router'
import { formatNumbersWithCommas } from '@banx/utils'

import { TIME_TO_CLAIM } from './constants'

import styles from './BanxRewardsTab.module.less'

const BanxRewardsTab = () => {
  const { theme } = useTheme()
  const Icon = theme === Theme.DARK ? BanxRewardsDarkIcon : BanxRewardsIcon

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <RewardsBlock />
        <InfoBlock />
      </div>
      <Icon className={styles.banxRewardsIcon} />
    </div>
  )
}

export default BanxRewardsTab

interface RewardsStatProps extends StatsInfoProps {
  value: number
  disabled: boolean
}

const RewardsStat: FC<RewardsStatProps> = ({ value, disabled, ...props }) => {
  const formattedValue = formatNumbersWithCommas((value / 1e9)?.toFixed(0))

  return (
    <div className={classNames(styles.statRewardWrapper, { [styles.disabled]: disabled })}>
      <CircleCheckIcon
        className={classNames(styles.circleCheckIcon, { [styles.disabled]: disabled })}
      />
      <StatInfo
        value={formattedValue}
        valueType={VALUES_TYPES.STRING}
        classNamesProps={{ container: styles.stat, value: styles.value }}
        icon={BanxTokenIcon}
        {...props}
      />
    </div>
  )
}

const RewardsBlock = () => {
  const { publicKey, connected } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { data } = useFetchUserRewards(publicKeyString)

  const slicedSources = (start: number, end: number) => slice(data?.sources, start, end)

  const totalRewards = sumBy(data?.sources?.map(([, value]) => value))

  const rows = [slicedSources(0, 3), slicedSources(3, 5), slicedSources(5, 7)]

  const availableToClaim = moment().unix() > TIME_TO_CLAIM

  return (
    <div className={styles.rewardsBlock}>
      <div className={styles.rewardsBlockTitleWrapper}>
        <h3 className={styles.rewardsBlockTitle}>Long journey together</h3>
        <HeartIcon />
      </div>

      <div className={styles.stats}>
        {rows.map((row, index) => (
          <div key={index} className={styles.row}>
            {row?.map(([label, value]) => (
              <RewardsStat
                key={label}
                label={label}
                value={value}
                disabled={!value || !connected}
              />
            ))}
          </div>
        ))}
      </div>

      <div className={styles.summary}>
        {!connected && (
          <EmptyList className={styles.emptyList} message="Connect wallet to see your rewards" />
        )}

        {connected && (
          <StatInfo
            label="Total rewards"
            value={formatNumbersWithCommas((totalRewards / 1e9)?.toFixed(0))}
            valueType={VALUES_TYPES.STRING}
            icon={BanxTokenIcon}
            classNamesProps={{
              container: styles.totalRewardsStat,
              label: styles.label,
              value: styles.value,
            }}
          />
        )}

        {!availableToClaim ? (
          <Tooltip title="There will be a link to claim here when time runs out">
            <>
              <Button className={styles.claimButton} disabled>
                <Timer expiredAt={TIME_TO_CLAIM} />
              </Button>
            </>
          </Tooltip>
        ) : (
          <a
            href={LAUNCH_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.claimButtonLink}
          >
            <Button className={styles.claimButton}>To claim</Button>
          </a>
        )}
      </div>
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
]
