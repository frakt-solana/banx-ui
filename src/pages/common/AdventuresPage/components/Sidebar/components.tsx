import { FC } from 'react'

import { ExclamationCircleOutlined } from '@ant-design/icons'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'

import { BanxToken } from '@banx/icons'
import { formatNumbersWithCommas, formatTrailingZeros } from '@banx/utils'

import styles from './SidebarComponents.module.less'

type TitleProps = {
  text: string
  icon: JSX.Element
  className?: string
}
export const Title: FC<TitleProps> = ({ text, icon, className }) => (
  <h2 className={classNames(styles.titleWrapper, className)}>
    <div className={styles.icon}>{icon}</div>
    <span>{text}</span>
  </h2>
)

type ManageStakeSectionProps = {
  value: string
  label: string
  onClick: () => void
  className?: string
}
export const ManageStakeSection: FC<ManageStakeSectionProps> = ({
  value,
  label,
  onClick,
  className,
}) => {
  return (
    <div className={classNames(styles.manageStakeSection, className)}>
      <StatInfo
        label={label}
        value={value}
        classNamesProps={{
          container: styles.manageStakeInfoContainer,
          label: styles.manageStakeInfoLabel,
          value: styles.manageStakeInfoValue,
        }}
      />

      <Button onClick={onClick} className={styles.manageStakeSectionBtn} variant="secondary">
        Manage
      </Button>
    </div>
  )
}

type WalletStakedStatsSectionProps = {
  totalPlayersPoints: number
  totalPartnerPoints: number
  className?: string
}
export const WalletStakedStatsSection: FC<WalletStakedStatsSectionProps> = ({
  totalPlayersPoints,
  totalPartnerPoints,
  className,
}) => {
  const TOOLTIP_TEXT =
    'The Banx ecosystem is governed by Partner and Player points. These points determine holder benefits, proportional to total amount of points staked.'

  const formattedTotalPartnerPoints = formatTrailingZeros(totalPartnerPoints.toFixed(2))
  const formattedTotalPlayersPoints = formatTrailingZeros(totalPlayersPoints.toFixed(2))

  return (
    <StatInfo
      label="Total points staked"
      classNamesProps={{
        container: className,
        label: styles.walletStakedStatsLabel,
        labelWrapper: styles.walletStakedStatsLabelWrapper,
      }}
      tooltipText={TOOLTIP_TEXT}
      value={
        <div className={styles.walletStakedStatsValues}>
          <p>{formatNumbersWithCommas(formattedTotalPartnerPoints)} partner</p>
          <p>{formatNumbersWithCommas(formattedTotalPlayersPoints)} player</p>
        </div>
      }
      flexType="row"
    />
  )
}

type ClaimSectionProps = {
  value: string
  className?: string
  disabled?: boolean
  onClick: () => void
}
export const ClaimSection: FC<ClaimSectionProps> = ({ value, onClick, disabled, className }) => {
  return (
    <div className={classNames(styles.claimSection, className)}>
      <StatInfo
        label="claimable"
        value={value}
        icon={BanxToken}
        classNamesProps={{
          container: styles.claimContainer,
          label: styles.claimLabel,
          value: styles.claimValue,
        }}
      />

      <Button onClick={onClick} disabled={disabled} className={styles.claimSectionBtn}>
        Claim
      </Button>
    </div>
  )
}

type TotalClaimedSectionProps = {
  value: string
  className?: string
}
export const TotalClaimedSection: FC<TotalClaimedSectionProps> = ({ value, className }) => {
  return (
    <StatInfo
      classNamesProps={{
        container: className,
        label: styles.walletStakedStatsLabel,
        labelWrapper: styles.walletStakedStatsLabelWrapper,
        value: styles.totalClaimedValue,
      }}
      label="Total claimed"
      value={value}
      icon={BanxToken}
      flexType="row"
    />
  )
}

type InfoSectionProps = {
  className?: string
}
export const InfoSection: FC<InfoSectionProps> = ({ className }) => (
  <div className={classNames(styles.infoSection, className)}>
    <p>
      <ExclamationCircleOutlined />
      As your Banx NFTs stay in your wallet when used as collateral for a loan on Banx.gg they can
      be sent in Adventures in parallel
    </p>
  </div>
)
