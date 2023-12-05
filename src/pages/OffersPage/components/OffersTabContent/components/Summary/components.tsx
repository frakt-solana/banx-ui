import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { formatDecimal } from '@banx/utils'

import styles from './Summary.module.less'

interface ButtonProps {
  onClick: () => void
  totalLoans?: number
  isSmallDesktop: boolean
  value: number
}

export const ClaimInterestButton: FC<ButtonProps> = (props) => {
  const { isSmallDesktop, onClick, value } = props
  const label = isSmallDesktop ? 'interest' : 'Accrued interest'

  return (
    <div className={styles.infoRow}>
      <div className={styles.loansContainer}>
        <p className={styles.loansValueText}>
          {createSolValueJSX(value, 1e9, '0◎', formatDecimal)}
        </p>
        <p className={styles.loansValueLabel}>{label}</p>
        <div className={styles.loansInterestContainer}>
          <StatInfo
            label={label}
            value={`${formatDecimal(value / 1e9)}◎`}
            classNamesProps={{ value: styles.value }}
            valueType={VALUES_TYPES.STRING}
          />
        </div>
      </div>
      <Button
        className={styles.summaryButton}
        onClick={onClick}
        disabled={!value}
        variant="secondary"
      >
        Claim
      </Button>
    </div>
  )
}

export const ClaimNFTsButton: FC<ButtonProps> = (props) => {
  const { isSmallDesktop, totalLoans, onClick, value } = props
  const buttonText = isSmallDesktop ? 'Claim' : 'Claim all NFTs'
  const label = isSmallDesktop ? 'Claimable floor' : 'Collateral'

  return (
    <div className={styles.infoRow}>
      <div className={styles.loansContainer}>
        <p className={styles.loansValueText}>{totalLoans}</p>
        <div className={styles.loansInfoContainer}>
          <StatInfo
            label={label}
            value={value}
            classNamesProps={{ value: styles.value }}
            divider={1e9}
          />
        </div>
      </div>
      <Button
        className={styles.summaryButton}
        onClick={onClick}
        disabled={!totalLoans}
        variant="secondary"
      >
        {buttonText}
      </Button>
    </div>
  )
}

export const TerminateButton: FC<ButtonProps> = (props) => {
  const { isSmallDesktop, totalLoans, onClick, value } = props
  const buttonText = isSmallDesktop ? 'Terminate' : 'Terminate all'
  const label = isSmallDesktop ? 'Underwater' : 'Underwater loans'

  return (
    <div className={styles.infoRow}>
      <div className={styles.loansContainer}>
        <p className={styles.loansValueText}>{totalLoans}</p>
        <div className={styles.loansInfoContainer}>
          <StatInfo
            label={label}
            value={value}
            classNamesProps={{ value: styles.value }}
            divider={1e9}
          />
        </div>
      </div>
      <Button
        className={classNames(styles.summaryButton, styles.terminateButton)}
        onClick={onClick}
        disabled={!totalLoans}
        variant="secondary"
      >
        {buttonText}
      </Button>
    </div>
  )
}
