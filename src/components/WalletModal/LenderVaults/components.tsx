import { FC } from 'react'

import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import moment from 'moment'

import { StatInfo } from '@banx/components/StatInfo'
import Timer from '@banx/components/Timer'

import { useClusterStats } from '@banx/hooks'
import { BanxSOL } from '@banx/icons'
import { useTokenType } from '@banx/store/common'
import { CountdownUnits, formatCountdownUnits, formatValueByTokenType } from '@banx/utils'

import { useLenderVaultInfo } from './hooks'

import styles from '../WalletModal.module.less'

export const BanxSolEpochContent = () => {
  const { data: clusterStats } = useClusterStats()
  const { lenderVaultInfo } = useLenderVaultInfo()
  const { tokenType } = useTokenType()
  const { banxSolYieldInCurrentEpoch, banxSolYieldInNextEpoch } = lenderVaultInfo
  const { epochApproxTimeRemaining = 0 } = clusterStats || {}
  const expiredAt = moment().unix() + epochApproxTimeRemaining

  const formattedTotalFundsInCurrentEpoch = banxSolYieldInCurrentEpoch
    ? formatValueByTokenType(banxSolYieldInCurrentEpoch, tokenType)
    : 0

  const formattedTotalFundsInNextEpoch = banxSolYieldInNextEpoch
    ? formatValueByTokenType(banxSolYieldInNextEpoch, tokenType)
    : 0

  return (
    <div className={styles.epochContainer}>
      <div className={styles.epochStats}>
        <StatInfo
          label="Epoch ends in"
          tooltipText="Liquid staking profit, awarded as 6% APR, based on the $SOL you hold in Banx for the entire epoch (excluding taken loans)"
          value={
            <Timer expiredAt={expiredAt} formatCountdownUnits={customEpochFormatCountdownUnits} />
          }
          icon={BanxSOL}
          flexType="row"
        />
        <StatInfo
          label="Yield for this epoch"
          tooltipText="Liquid staking profit, awarded as 6% APR, based on the $SOL you hold in Banx for the entire epoch (excluding taken loans)"
          value={formattedTotalFundsInCurrentEpoch}
          icon={BanxSOL}
          flexType="row"
        />
        <StatInfo
          label="Yield for next epoch"
          tooltipText="Projected liquid staking profit, awarded as 6% APR, based on the $SOL you hold in Banx throughout the next epoch (excluding taken loans)"
          value={formattedTotalFundsInNextEpoch}
          icon={BanxSOL}
          flexType="row"
        />
      </div>
    </div>
  )
}

export const customEpochFormatCountdownUnits = (countdownUnits: CountdownUnits): string => {
  const { days, hours, minutes } = countdownUnits

  if (!days && !hours && !minutes) {
    return '<1m'
  }
  if (!days && !hours) {
    return formatCountdownUnits(countdownUnits, 'm')
  }

  if (!days) {
    return formatCountdownUnits(countdownUnits, 'h:m')
  }

  return formatCountdownUnits(countdownUnits, 'd:h')
}

interface YieldStatProps {
  totalYield: number
  tokenType: LendingTokenType
}

export const YieldStat: FC<YieldStatProps> = ({ totalYield, tokenType }) => {
  const formattedTotalYield = totalYield ? formatValueByTokenType(totalYield, tokenType) : 0

  return (
    <StatInfo
      label="LST yield"
      tooltipText="Yield generated from the BanxSOL integrated Liquid Staking Token, based on the $SOL you hold in Banx throughout a whole epoch, excluding $SOL in taken loans"
      value={formattedTotalYield}
      classNamesProps={{ value: styles.claimableValue }}
      icon={BanxSOL}
    />
  )
}
