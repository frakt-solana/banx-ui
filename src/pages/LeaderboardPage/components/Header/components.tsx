import { FC, SVGProps } from 'react'

import { NavLink } from 'react-router-dom'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import Tooltip from '@banx/components/Tooltip'

import { PATHS } from '@banx/router'
import {
  HealthColorDecreasing,
  formatNumbersWithCommas,
  getColorByPercent,
  shortenAddress,
} from '@banx/utils'

import styles from './Header.module.less'

interface ParticipantsInfoProps {
  participants: number
}
export const ParticipantsInfo: FC<ParticipantsInfoProps> = ({ participants }) => (
  <StatInfo
    label="Total participants"
    value={formatNumbersWithCommas(participants)}
    valueType={VALUES_TYPES.STRING}
    classNamesProps={{
      container: styles.participantsInfo,
      value: styles.participantsValue,
      label: styles.participantsLable,
    }}
  />
)

interface WalletInfoProps {
  walletPublicKey: string
}
export const WalletInfo: FC<WalletInfoProps> = ({ walletPublicKey }) => {
  return (
    <>
      <div className={styles.walletInfo}>
        <span className={styles.walletAddress}>{shortenAddress(walletPublicKey)}</span>
        <Button className={styles.connectWalletButton} variant="secondary" size="small">
          Link wallets
        </Button>
      </div>
      <div className={styles.walletInfoMobile}>
        <div className={styles.walletInfoMobileBadge}>{walletPublicKey.slice(0, 4)}</div>
      </div>
    </>
  )
}

interface LoyaltyInfoProps {
  multiplier: number
}
export const LoyaltyBlock: FC<LoyaltyInfoProps> = ({ multiplier }) => (
  <div className={styles.loyaltyContainer}>
    <div className={styles.loyaltyInfoWrapper}>
      <LoyaltyInfo multiplier={multiplier} />
      <NavLink className={styles.stakeBanxButton} to={PATHS.ADVENTURES}>
        <Button variant="secondary" size="small">
          Stake Banx
        </Button>
      </NavLink>
    </div>
    <SemiCircleProgress percentage={70} />
  </div>
)

const LoyaltyInfo: FC<LoyaltyInfoProps> = ({ multiplier }) => (
  <div className={styles.loyaltyInfo}>
    <span className={styles.loyaltyMultiplier}>{multiplier}x</span>
    <div className={styles.loyaltyDetails}>
      <span className={styles.loyaltyTitle}>
        Boost
        <Tooltip title="Rewards are boosted by staking Banx NFTs, the more player points staked the higher the boost" />
      </span>
      <span className={styles.loyaltySubtitle}>Want to increase your boost?</span>
    </div>
  </div>
)

export const NoConnectedWalletInfo = () => (
  <span className={styles.notConnectedTitle}>Unknown Banx</span>
)

interface SemiCircleProgressBarProps {
  percentage: number
}

const SemiCircleProgress: FC<SemiCircleProgressBarProps> = ({ percentage }) => {
  const halfPercentage = percentage / 2

  const strokeWidth = 4
  const radius = 50 - strokeWidth / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = (1 - halfPercentage / 100) * circumference

  const commonPathProps: SVGProps<SVGPathElement> = {
    d: `M${50 - radius},50 A${radius},${radius} 0 0 1 ${50 + radius},50`,
    fill: 'transparent',
    strokeWidth,
    strokeLinecap: 'round',
  }

  const loyaltyColor = getColorByPercent(percentage, HealthColorDecreasing)

  return (
    <div className={styles.progressContainer}>
      <svg viewBox="0 0 100 140">
        <path {...commonPathProps} stroke="#efefef" />
        <path
          {...commonPathProps}
          stroke={loyaltyColor}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          d={`M${50 - radius},50 A${radius},${radius} 0 ${halfPercentage > 80 ? 1 : 0} 1 ${
            50 + radius
          },50`}
        />
      </svg>
      <StatInfo
        classNamesProps={{ container: styles.textContainer, value: styles.value }}
        valueStyles={{ color: loyaltyColor }}
        label="Loyalty"
        value={percentage}
        valueType={VALUES_TYPES.PERCENT}
        tooltipText="Loyalty tracks % of your loans on Banx vs other protocols. Loyalty impacts the amount of rewards; if you're more loyal you'll get much more rewards"
      />
    </div>
  )
}
