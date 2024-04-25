import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import {
  HeaderCell,
  HorizontalCell,
  NftInfoCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'
import Timer from '@banx/components/Timer/Timer'
import Tooltip from '@banx/components/Tooltip'

import { Loan } from '@banx/api/core'
import { SECONDS_IN_72_HOURS } from '@banx/constants'
import { Hourglass, Snowflake } from '@banx/icons'
import { isFreezeLoan } from '@banx/utils'

import { ActionsCell, DebtCell, LTVCell } from './TableCells'

import styles from './InstantLendTable.module.less'

interface GetTableColumnsProps {
  toggleLoanInSelection: (loan: Loan) => void
  findLoanInSelection: (loanPubkey: string) => Loan | null
  onSelectAll: () => void
  isCardView: boolean
  hasSelectedLoans: boolean
}

export const getTableColumns = ({
  isCardView,
  toggleLoanInSelection,
  findLoanInSelection,
  onSelectAll,
  hasSelectedLoans,
}: GetTableColumnsProps) => {
  const columns: ColumnType<Loan>[] = [
    {
      key: 'collateral',
      title: (
        <div className={styles.headerTitleRow}>
          <Checkbox className={styles.checkbox} onChange={onSelectAll} checked={hasSelectedLoans} />
          <HeaderCell label="Collateral" />
        </div>
      ),
      render: (loan) => (
        <NftInfoCell
          key={loan.publicKey}
          selected={!!findLoanInSelection(loan.publicKey)}
          onCheckboxClick={() => toggleLoanInSelection(loan)}
          nftName={loan.nft.meta.name}
          nftImage={loan.nft.meta.imageUrl}
          banxPoints={{
            partnerPoints: loan.nft.meta.partnerPoints || 0,
            playerPoints: loan.nft.meta.playerPoints || 0,
          }}
          rightContentJSX={createRightContentJSX(loan)}
        />
      ),
    },
    {
      key: 'repayValue',
      title: <HeaderCell label="Debt" />,
      render: (loan) => <DebtCell loan={loan} />,
    },
    {
      key: 'ltv',
      title: <HeaderCell label="LTV" />,
      render: (loan) => <LTVCell loan={loan} />,
    },
    {
      key: 'freeze',
      title: <HeaderCell label="Freeze" />,
      render: (loan) => {
        const freezeValue = isFreezeLoan(loan) ? loan.bondTradeTransaction.terminationFreeze : 0
        return <HorizontalCell value={`${freezeValue} days`} />
      },
    },
    {
      key: 'duration',
      title: <HeaderCell label="Ends in" />,
      render: ({ fraktBond }) => (
        <Timer expiredAt={fraktBond.refinanceAuctionStartedAt + SECONDS_IN_72_HOURS} />
      ),
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" />,
      render: (loan) => (
        <HorizontalCell
          value={createPercentValueJSX(loan.bondTradeTransaction.amountOfBonds / 100)}
          isHighlighted
        />
      ),
    },
    {
      key: 'refinanceCell',
      title: <HeaderCell label="" />,
      render: (loan) => (
        <ActionsCell
          loan={loan}
          isCardView={isCardView}
          disabledAction={!!findLoanInSelection(loan.publicKey)}
        />
      ),
    },
  ]

  return columns
}

const createRightContentJSX = (loan: Loan) => {
  const tooltipText = isFreezeLoan(loan) ? 'Tooltip text' : 'Tooltip text'

  return (
    <Tooltip className={styles.loanTypeTooltipContent} title={tooltipText}>
      {isFreezeLoan(loan) ? (
        <Snowflake className={styles.snowflakeIcon} />
      ) : (
        <Hourglass className={styles.hourglassIcon} />
      )}
    </Tooltip>
  )
}
