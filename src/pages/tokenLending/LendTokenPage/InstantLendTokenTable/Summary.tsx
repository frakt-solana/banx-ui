import React, { FC, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { map, maxBy, sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'
import { useWalletModal } from '@banx/components/WalletModal'
import { Modal } from '@banx/components/modals/BaseModal'

import { core } from '@banx/api/tokens'
import { SECONDS_IN_DAY } from '@banx/constants'
import { useModal } from '@banx/store/common'
import {
  calcWeightedAverage,
  calculateTokenLoanLtvByLoanValue,
  isTokenLoanFrozen,
} from '@banx/utils'

import { calcTokenWeeklyInterest, calculateLendToBorrowValue } from './helpers'
import { useInstantTokenTransactions } from './hooks'
import { useLoansTokenState } from './loansState'

import styles from './InstantLendTokenTable.module.less'

export const Summary: FC<{ loans: core.TokenLoan[] }> = ({ loans }) => {
  const { connected } = useWallet()
  const { toggleVisibility } = useWalletModal()
  const { lendToBorrowAll } = useInstantTokenTransactions()
  const { selection, set: setSelection } = useLoansTokenState()

  const { open } = useModal()

  const frozenLoans = useMemo(() => {
    return selection.filter(isTokenLoanFrozen)
  }, [selection])

  const showModal = () => {
    open(WarningModal, { loans: frozenLoans, lendToBorrowAll })
  }

  const { totalDebt, totalWeeklyInterest, weightedApr, weightedLtv } =
    calculateSummaryInfo(selection)

  const onClickHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation()

    if (!connected) {
      return toggleVisibility()
    }

    if (frozenLoans.length) {
      return showModal()
    }

    return lendToBorrowAll()
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

interface WarningModalProps {
  loans: core.TokenLoan[]
  lendToBorrowAll: () => Promise<void>
}

const WarningModal: FC<WarningModalProps> = ({ loans, lendToBorrowAll }) => {
  const { close } = useModal()

  const totalLoans = loans.length

  const maxTerminateFreezeInDays =
    maxBy(map(loans, (loan) => loan.bondTradeTransaction.terminationFreeze / SECONDS_IN_DAY)) || 0

  return (
    <Modal className={styles.modal} open onCancel={close} width={496}>
      <h3>Please pay attention!</h3>
      <p>
        Are you sure you want to fund {totalLoans} loans for up to {maxTerminateFreezeInDays} days
        with no termination option?
      </p>
      <div className={styles.actionsButtons}>
        <Button onClick={close} className={styles.cancelButton}>
          Cancel
        </Button>
        <Button onClick={lendToBorrowAll} className={styles.confirmButton}>
          Confirm
        </Button>
      </div>
    </Modal>
  )
}

const calculateSummaryInfo = (loans: core.TokenLoan[]) => {
  const totalDebt = sumBy(loans, (loan) => calculateLendToBorrowValue(loan))

  const totalLoanValue = map(loans, (loan) => calculateLendToBorrowValue(loan))
  const totalWeeklyInterest = sumBy(loans, (loan) => calcTokenWeeklyInterest(loan))

  const totalAprArray = map(loans, (loan) => loan.bondTradeTransaction.amountOfBonds / 100)
  const totalLtvArray = map(loans, (loan) =>
    calculateTokenLoanLtvByLoanValue(loan, calculateLendToBorrowValue(loan)),
  )

  const weightedApr = calcWeightedAverage(totalAprArray, totalLoanValue)
  const weightedLtv = calcWeightedAverage(totalLtvArray, totalLoanValue)

  return { totalDebt, totalWeeklyInterest, weightedApr, weightedLtv }
}
