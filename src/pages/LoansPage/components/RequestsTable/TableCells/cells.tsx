import { FC } from 'react'

import { Button } from '@banx/components/Buttons'
import { HorizontalCell, createPercentValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { HealthColorIncreasing, calculateLoanRepayValue, getColorByPercent } from '@banx/utils'

import styles from '../RequestsTable.module.less'

export const LTVCell: FC<{ loan: Loan }> = ({ loan }) => {
  const debtValue = calculateLoanRepayValue(loan)
  const collectionFloor = loan.nft.collectionFloor

  const ltvPercent = (debtValue / collectionFloor) * 100
  const formattedLtvValue = createPercentValueJSX(ltvPercent)

  return (
    <HorizontalCell
      value={formattedLtvValue}
      textColor={getColorByPercent(ltvPercent, HealthColorIncreasing)}
    />
  )
}

export const APRCell: FC<{ loan: Loan }> = ({ loan }) => {
  const amountOfBondsWithProtocolFee =
    loan.bondTradeTransaction.amountOfBonds + BONDS.PROTOCOL_REPAY_FEE

  const aprInPercent = amountOfBondsWithProtocolFee / 100

  return <HorizontalCell value={createPercentValueJSX(aprInPercent)} isHighlighted />
}

interface ActionsCellProps {
  loan: Loan
  disabled: boolean
  isCardView: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ disabled, isCardView }) => {
  return (
    <Button
      size={isCardView ? 'default' : 'small'}
      className={styles.delistButton}
      disabled={disabled}
    >
      Delist
    </Button>
  )
}
