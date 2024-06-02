import React, { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'
import { useWalletModal } from '@banx/components/WalletModal'

import { core } from '@banx/api/tokens'

import { useLoansTokenState } from './loansState'

import styles from './InstantLendTokenTable.module.less'

export const Summary: FC<{ loans: core.TokenLoan[] }> = ({ loans }) => {
  const { connected } = useWallet()
  const { toggleVisibility } = useWalletModal()
  const { selection, set: setSelection } = useLoansTokenState()

  const totalDebt = 0
  const totalWeeklyInterest = 0
  const weightedApr = 0
  const weightedLtv = 0

  const onClickHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation()

    if (!connected) {
      return toggleVisibility()
    }

    return 
  }

  const handleLoanSelection = (value = 0) => {
    setSelection(loans.slice(0, value))
  }

  return (
    <div className={styles.summary}>
      <div className={styles.mainStat}>
        <p>{createPercentValueJSX(weightedApr, '0%')}</p>
        <p>Weighted apr</p>
      </div>
      <div className={styles.statsContainer}>
        <StatInfo label="Weighted ltv" value={weightedLtv} valueType={VALUES_TYPES.PERCENT} />
        <StatInfo label="Weekly interest" value={<DisplayValue value={totalWeeklyInterest} />} />
        <StatInfo
          label="Weighted apr"
          value={weightedApr}
          valueType={VALUES_TYPES.PERCENT}
          classNamesProps={{ container: styles.weightedAprStat }}
        />
      </div>
      <div className={styles.summaryControls}>
        <CounterSlider
          label="# Loans"
          value={selection.length}
          onChange={(value) => handleLoanSelection(value)}
          max={loans.length}
          className={styles.sliderContainer}
          rootClassName={styles.slider}
        />
        <Button className={styles.lendButton} onClick={onClickHandler} disabled={!selection.length}>
          Lend <DisplayValue value={totalDebt} />
        </Button>
      </div>
    </div>
  )
}
