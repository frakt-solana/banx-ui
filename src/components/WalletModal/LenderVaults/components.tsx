import { FC } from 'react'

import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { EpochProgressBar } from '@banx/components/EpochProgressBar'
import { StatInfo } from '@banx/components/StatInfo'

import { BanxSOL } from '@banx/icons'
import { formatValueByTokenType } from '@banx/utils'

import styles from '../WalletModal.module.less'

interface BanxSolEpochContentProps {
  currentEpochYield: number
  nextEpochYield: number
  tokenType: LendingTokenType
}

export const BanxSolEpochContent: FC<BanxSolEpochContentProps> = ({
  currentEpochYield,
  nextEpochYield,
  tokenType,
}) => {
  const formattedTotalFundsInCurrentEpoch = currentEpochYield
    ? formatValueByTokenType(currentEpochYield, tokenType)
    : 0

  const formattedTotalFundsInNextEpoch = nextEpochYield
    ? formatValueByTokenType(nextEpochYield, tokenType)
    : 0

  return (
    <div className={styles.epochContainer}>
      <EpochProgressBar />
      <div className={styles.epochStats}>
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
