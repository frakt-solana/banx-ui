import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'

import styles from './Summary.module.less'

interface CustomButtonProps extends Omit<ButtonProps, 'isMobile'> {
  label: string
  buttonText: string
  buttonClassName?: string
}

export const CustomButton: FC<CustomButtonProps> = ({
  totalLoans,
  value,
  onClick,
  label,
  buttonText,
  buttonClassName,
}) => {
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
        className={classNames(styles.summaryButton, buttonClassName)}
        onClick={onClick}
        disabled={!totalLoans}
        variant="secondary"
      >
        {buttonText}
      </Button>
    </div>
  )
}

interface ButtonProps {
  onClick: () => void
  totalLoans: number
  value: number
  isMobile: boolean
}

export const ClaimInterestButton: FC<ButtonProps> = (props) => {
  const { isMobile, ...rest } = props

  return (
    <CustomButton
      {...rest}
      label={!isMobile ? 'Accrued interest' : 'Interest'}
      buttonText="Claim"
    />
  )
}

export const ClaimNFTsButton: FC<ButtonProps> = (props) => {
  const { isMobile, ...rest } = props

  return (
    <CustomButton
      {...rest}
      label={!props.isMobile ? 'Collateral' : 'Claimable floor'}
      buttonText={!props.isMobile ? 'Claim all NFT' : 'Claim'}
    />
  )
}

export const TerminateButton: FC<ButtonProps> = (props) => {
  const { isMobile, ...rest } = props

  return (
    <CustomButton
      {...rest}
      label={!props.isMobile ? 'Underwater loans' : 'Underwater'}
      buttonText={!props.isMobile ? 'Terminate all' : 'Terminate'}
      buttonClassName={styles.terminateButton}
    />
  )
}
