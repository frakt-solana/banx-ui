import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { ChevronDown } from '@banx/icons'
import { useTokenType } from '@banx/store/common'
import { getTokenDecimals } from '@banx/utils'

import { LoansPreview } from '../../helpers'

import styles from './CollateralLoansCard.module.less'

interface CollateralLoansCardProps {
  loansPreview: LoansPreview
  onClick: () => void
  isExpanded: boolean
}

const CollateralLoansCard: FC<CollateralLoansCardProps> = ({
  loansPreview,
  onClick,
  isExpanded,
}) => {
  const { collareralTicker, collateralLogoUrl } = loansPreview

  return (
    <div className={styles.card}>
      <div
        onClick={onClick}
        className={classNames(styles.cardBody, { [styles.expanded]: isExpanded })}
      >
        <div className={styles.mainInfoContainer}>
          <img src={collateralLogoUrl} className={styles.collateralImage} />
          <h4 className={styles.collateralName}>{collareralTicker}</h4>
        </div>

        <div className={styles.additionalContentWrapper}>
          <CollateralLoansAdditionalInfo loansPreview={loansPreview} isExpanded={isExpanded} />

          <Button
            type="circle"
            size="medium"
            className={classNames(styles.expandButton, { [styles.expanded]: isExpanded })}
          >
            <ChevronDown />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CollateralLoansCard

interface CollateralLoansAdditionalInfoProps {
  loansPreview: LoansPreview
  isExpanded: boolean
}

const CollateralLoansAdditionalInfo: FC<CollateralLoansAdditionalInfoProps> = ({
  loansPreview,
  isExpanded,
}) => {
  const { collateralPrice, totalDebt, weightedLtv, weightedApr } = loansPreview

  const { tokenType } = useTokenType()
  const marketTokenDecimals = getTokenDecimals(tokenType) //? 1e9, 1e6

  const classNamesProps = {
    container: styles.additionalInfoStat,
    labelWrapper: styles.additionalInfoStatLabelWrapper,
  }

  return (
    <div className={classNames(styles.additionalInfoStats, { [styles.expanded]: isExpanded })}>
      <StatInfo
        label="Price"
        value={<DisplayValue value={collateralPrice / marketTokenDecimals} isSubscriptFormat />}
        classNamesProps={classNamesProps}
      />

      <StatInfo
        label="Total debt"
        value={<DisplayValue value={totalDebt} />}
        classNamesProps={classNamesProps}
      />

      <StatInfo
        label="WLTV"
        value={weightedLtv}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={classNamesProps}
      />

      <StatInfo
        label="WAPR"
        value={weightedApr}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={{ ...classNamesProps, value: styles.additionalAprStat }}
      />

      <StatInfo label="Status" value="status" classNamesProps={classNamesProps} />
    </div>
  )
}
