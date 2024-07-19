import React, { FC } from 'react'

import { Button } from '@banx/components/Buttons'
import { HorizontalCell, createPercentValueJSX } from '@banx/components/TableComponents'

import { coreNew } from '@banx/api/nft'
import { BONDS, SECONDS_IN_DAY } from '@banx/constants'
import { HealthColorIncreasing, getColorByPercent, isFreezeLoan } from '@banx/utils'

import { useRequestLoansTransactions } from '../hooks'

import styles from '../RequestLoansTable.module.less'

export const LTVCell: FC<{ loan: coreNew.Loan }> = ({ loan }) => {
  const borrowedValue = loan.fraktBond.borrowedAmount.toNumber()
  const collectionFloor = loan.nft.collectionFloor.toNumber()

  const ltvPercent = (borrowedValue / collectionFloor) * 100
  const formattedLtvValue = createPercentValueJSX(ltvPercent)

  return (
    <HorizontalCell
      value={formattedLtvValue}
      textColor={getColorByPercent(ltvPercent, HealthColorIncreasing)}
    />
  )
}

export const APRCell: FC<{ loan: coreNew.Loan }> = ({ loan }) => {
  const aprPercent =
    loan.bondTradeTransaction.amountOfBonds.add(BONDS.PROTOCOL_REPAY_FEE_BN).toNumber() / 100

  return <HorizontalCell value={createPercentValueJSX(aprPercent)} isHighlighted />
}

export const FreezeCell: FC<{ loan: coreNew.Loan }> = ({ loan }) => {
  const terminationFreezeInDays =
    loan.bondTradeTransaction.terminationFreeze.toNumber() / SECONDS_IN_DAY
  const freezeValue = isFreezeLoan(loan) ? `${terminationFreezeInDays} days` : '--'

  return <HorizontalCell value={freezeValue} />
}

interface ActionsCellProps {
  loan: coreNew.Loan
  disabled: boolean
  isCardView: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ loan, disabled, isCardView }) => {
  const { delist } = useRequestLoansTransactions()

  const onButtonClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    delist(loan)
    event.stopPropagation()
  }

  return (
    <Button
      onClick={onButtonClick}
      size={isCardView ? 'default' : 'small'}
      className={styles.delistButton}
      disabled={disabled}
    >
      Delist
    </Button>
  )
}
