import React, { FC } from 'react'

import { web3 } from 'fbonds-core'
import { calcBorrowerTokenAPR } from 'fbonds-core/lib/fbond-protocol/helpers'

import { Button } from '@banx/components/Buttons'
import { HorizontalCell, createPercentValueJSX } from '@banx/components/TableComponents'

import { TokenLoan } from '@banx/api/tokens'
import { SECONDS_IN_DAY } from '@banx/constants'
import {
  HealthColorIncreasing,
  calculateTokenLoanLtvByLoanValue,
  getColorByPercent,
  isTokenLoanFrozen,
} from '@banx/utils'

import { useTokenLoanListingsTransactions } from './hooks'

import styles from './TokenLoanListingsTable.module.less'

export const LTVCell: FC<{ loan: TokenLoan }> = ({ loan }) => {
  const borrowedValue = loan.fraktBond.borrowedAmount

  const ltvPercent = calculateTokenLoanLtvByLoanValue(loan, borrowedValue)

  return (
    <HorizontalCell
      value={createPercentValueJSX(ltvPercent)}
      textColor={getColorByPercent(ltvPercent, HealthColorIncreasing)}
    />
  )
}

export const APRCell: FC<{ loan: TokenLoan }> = ({ loan }) => {
  const marketPubkey = new web3.PublicKey(loan.fraktBond.hadoMarket)
  const aprRate = loan.bondTradeTransaction.amountOfBonds

  const aprPercent = calcBorrowerTokenAPR(aprRate, marketPubkey) / 100

  return <HorizontalCell value={createPercentValueJSX(aprPercent)} isHighlighted />
}

export const FreezeCell: FC<{ loan: TokenLoan }> = ({ loan }) => {
  const terminationFreezeInDays = loan.bondTradeTransaction.terminationFreeze / SECONDS_IN_DAY
  const freezeDuration = isTokenLoanFrozen(loan) ? `${terminationFreezeInDays} days` : '--'

  return <HorizontalCell value={freezeDuration} />
}

interface ActionsCellProps {
  loan: TokenLoan
  disabled: boolean
  isCardView: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ loan, disabled, isCardView }) => {
  const { delist } = useTokenLoanListingsTransactions()

  const onButtonClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    delist(loan)
    event.stopPropagation()
  }

  return (
    <Button
      onClick={onButtonClick}
      size={isCardView ? 'large' : 'medium'}
      className={styles.delistButton}
      disabled={disabled}
    >
      Delist
    </Button>
  )
}
