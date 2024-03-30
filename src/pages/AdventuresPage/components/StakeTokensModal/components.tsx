import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import Tooltip from '@banx/components/Tooltip'
import NumericInput, { NumericInputProps } from '@banx/components/inputs/NumericInput'

import { BanxToken } from '@banx/icons'
import { formatNumbersWithCommas } from '@banx/utils'

import styles from './StakeTokensModal.module.less'

interface BanxPointsStatsProps {
  partnerPoints: number
  playerPoints: number
}

export const BanxPointsStats: FC<BanxPointsStatsProps> = ({ partnerPoints, playerPoints }) => {
  const formattedPlayerPoints = playerPoints?.toFixed(2)
  const formattedPartnerPoints = partnerPoints?.toFixed(2)

  const statClassNames = {
    container: styles.banxPointsStat,
    value: styles.value,
    label: styles.label,
  }

  return (
    <div className={styles.banxPointsStats}>
      <StatInfo
        label="Partner points"
        value={formattedPartnerPoints}
        classNamesProps={statClassNames}
        valueType={VALUES_TYPES.STRING}
      />
      <StatInfo
        label="Player points"
        value={formattedPlayerPoints}
        classNamesProps={statClassNames}
        valueType={VALUES_TYPES.STRING}
      />
    </div>
  )
}

export const BanxWalletBalance: FC<{ banxWalletBalance: number }> = ({ banxWalletBalance }) => {
  const formattedBanxWalletBalance = formatNumbersWithCommas(banxWalletBalance.toFixed(2))

  return (
    <div className={styles.statInfo}>
      <span className={styles.label}>Wallet balance</span>
      <span className={styles.value}>{formattedBanxWalletBalance}</span>
      <BanxToken />
    </div>
  )
}

export const TotalStakedInfo: FC<{ tokensStaked: number }> = ({ tokensStaked }) => {
  const formattedTokensStaked = formatNumbersWithCommas(tokensStaked.toFixed(2))

  return (
    <div className={styles.statInfo}>
      <span className={styles.label}>Total staked</span>
      <span className={styles.value}>{formattedTokensStaked}</span>
      <BanxToken />
    </div>
  )
}

export const Title: FC<{ title: string }> = ({ title }) => (
  <p className={styles.title}>
    <span>{title}</span>
    <Tooltip title="The Banx ecosystem is governed by Partner and Player points. These points determine holder benefits, proportional to total amount of points staked." />
  </p>
)

interface TokenInputFieldProps extends NumericInputProps {
  onMax: () => void
}

export const TokenInputField: FC<TokenInputFieldProps> = ({ value, onChange, onMax }) => {
  return (
    <div className={styles.input}>
      <NumericInput value={value} onChange={onChange} placeholder="0" positiveOnly />
      <Button onClick={onMax} size="small" variant="secondary">
        Use max
      </Button>
    </div>
  )
}

interface IdleTokensBalanceProps {
  label: string
  value: number
}

export const IdleTokensBalance: FC<IdleTokensBalanceProps> = ({ value, label }) => {
  const formattedIdleTokensBalance = formatNumbersWithCommas(value?.toFixed(2))

  return (
    <div className={classNames(styles.statInfo, styles.spaceBetween)}>
      <span className={styles.label}>{label}</span>
      <div className={styles.row}>
        <span className={styles.value}>{formattedIdleTokensBalance}</span>
        <BanxToken />
      </div>
    </div>
  )
}
