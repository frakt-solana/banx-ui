import { FC } from 'react'

import { PlusOutlined } from '@ant-design/icons'
import { useWallet } from '@solana/wallet-adapter-react'
import { NavLink } from 'react-router-dom'

import { Button } from '@banx/components/Buttons'
import EmptyList from '@banx/components/EmptyList/EmptyList'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { useFetchUserLockedRewards } from '@banx/components/WalletModal'

import { Theme, useTheme } from '@banx/hooks'
import {
  BanxRewardsDark as BanxRewardsDarkIcon,
  BanxRewards as BanxRewardsIcon,
  CircleCheck as CircleCheckIcon,
} from '@banx/icons'
import { PATHS } from '@banx/router'
import { formatNumbersWithCommas } from '@banx/utils'

import styles from './BanxRewardsTab.module.less'
import { web3 } from 'fbonds-core'

const statClassNames = {
  container: styles.statContainer,
  value: styles.statValue,
  label: styles.statLabel,
}

const BanxRewardsTab = () => {
  const { connected } = useWallet()

  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { data } = useFetchUserLockedRewards(publicKeyString)

  const { theme } = useTheme()
  const Icon = theme === Theme.DARK ? BanxRewardsDarkIcon : BanxRewardsIcon

  const alloc = data?.sum ? (data?.sum / BigInt(web3.LAMPORTS_PER_SOL)) : BigInt(0);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <StatInfo value={`${formatNumbersWithCommas(alloc.toString())} $BANX`} label='Total rewards' classNamesProps={statClassNames}
          valueType={VALUES_TYPES.STRING} />
        <StatsBlock earlyIncentives={data?.sum || BigInt(0)} sources={data?.sources || []} />
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

interface StatsBlockProps {
  earlyIncentives: bigint,
  sources: any[]
}

const StatsBlock: FC<StatsBlockProps> = ({ earlyIncentives, sources }) => {


  const alloc = earlyIncentives / BigInt(web3.LAMPORTS_PER_SOL);

  return (<div className={styles.stats}>
    {
      sources.map((carr, i) => {
        const name = carr[0];
        const value = BigInt(carr[1]) / BigInt(web3.LAMPORTS_PER_SOL);
        return <StatInfo
          key={i}
          label={name}
          value={`${formatNumbersWithCommas(value.toString())} $BANX`}
          classNamesProps={statClassNames}
          valueType={VALUES_TYPES.STRING}
        //tooltipText="We converted the locked $FRKT rewards you received from past marketing campaigns to their equivalent amount of $BANX tokens"
        />
      })
    }

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
  // 'At IDO, $banx rewards will start to unlock linearly over a year period',
]
