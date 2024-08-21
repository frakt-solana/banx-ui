import { FC } from 'react'

import Skeleton from 'antd/es/skeleton'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { BorrowOffer } from '@banx/api/tokens'

import { getSummaryInfo } from './helpers'

import styles from './InstantBorrowContent.module.less'

interface SummaryProps {
  offers: BorrowOffer[]
}

export const Summary: FC<SummaryProps> = ({ offers }) => {
  const { upfrontFee, weightedApr, weightedLtv, weeklyFee } = getSummaryInfo(offers)

  const statClassNames = {
    value: styles.fixedStatValue,
  }

  return (
    <div className={styles.summary}>
      <StatInfo
        label="Upfront fee"
        value={<DisplayValue value={upfrontFee} />}
        tooltipText="1% upfront fee charged on the loan principal amount, paid when loan is funded"
        classNamesProps={statClassNames}
        flexType="row"
      />
      <StatInfo
        label="Est weekly fee"
        value={<DisplayValue value={weeklyFee} />}
        tooltipText="Expected weekly interest on your loans. Interest is added to your debt balance"
        classNamesProps={statClassNames}
        flexType="row"
      />
      <StatInfo
        label="Weighted APR"
        value={weightedApr / 100}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={statClassNames}
        tooltipText="An annual percentage rate that accounts for different loan amounts and their respective interest rates, providing a comprehensive view of the overall interest cost"
        flexType="row"
      />
      <StatInfo
        label="Weighted LTV"
        value={weightedLtv / 100}
        valueType={VALUES_TYPES.PERCENT}
        tooltipText="Weighted LTV"
        flexType="row"
      />
    </div>
  )
}

const SkeletonStatValue = <Skeleton.Input style={{ height: 16 }} size="small" />

export const SummarySkeleton = () => {
  return (
    <div className={styles.summary}>
      <StatInfo
        label="Upfront fee"
        value={SkeletonStatValue}
        tooltipText="1% upfront fee charged on the loan principal amount, paid when loan is funded"
        flexType="row"
      />
      <StatInfo
        label="Est weekly fee"
        value={SkeletonStatValue}
        tooltipText="Expected weekly interest on your loans. Interest is added to your debt balance"
        flexType="row"
      />
      <StatInfo
        label="Weighted APR"
        value={SkeletonStatValue}
        tooltipText="An annual percentage rate that accounts for different loan amounts and their respective interest rates, providing a comprehensive view of the overall interest cost"
        flexType="row"
      />
      <StatInfo
        label="Weighted LTV"
        value={SkeletonStatValue}
        tooltipText="Weighted LTV"
        flexType="row"
      />
    </div>
  )
}
