import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'
import { createSolValueJSX } from '@banx/components/TableComponents'

import styles from './Summary.module.less'

interface ButtonProps {
  onClick: () => void
  totalLoans: number
  isMobile: boolean
  value: number
}

export const ClaimInterestButton: FC<ButtonProps> = (props) => {
  const { isMobile, totalLoans, onClick, value } = props
  const label = isMobile ? 'interest' : 'Accrued interest'

  return (
    <div className={styles.infoRow}>
      <div className={styles.loansContainer}>
        <p className={styles.loansValueText}>{createSolValueJSX(value, 1e9, '0◎')}</p>
        <p className={styles.loansValueLabel}>{label}</p>
        <div className={styles.loansInterestContainer}>
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
        Claim
      </Button>
    </div>
  )
}

export const ClaimNFTsButton: FC<ButtonProps> = (props) => {
  const { isMobile, totalLoans, onClick, value } = props
  const buttonText = isMobile ? 'Claim all NFT' : 'Claim'
  const label = isMobile ? 'Collateral' : 'Claimable floor'

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
  const { isMobile, totalLoans, onClick, value } = props
  const buttonText = isMobile ? 'Terminate all' : 'Terminate'
  const label = isMobile ? 'Underwater' : 'Underwater loans'

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
