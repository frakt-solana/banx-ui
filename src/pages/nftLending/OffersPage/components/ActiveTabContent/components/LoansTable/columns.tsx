import { FC, ReactNode } from 'react'

import Checkbox from '@banx/components/Checkbox'
import { ColumnType } from '@banx/components/Table'
import {
  DisplayValue,
  HeaderCell,
  HorizontalCell,
  NftInfoCell,
  RarityCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'
import Timer from '@banx/components/Timer'
import Tooltip from '@banx/components/Tooltip'

import { core } from '@banx/api/nft'
import { Coin, Snowflake } from '@banx/icons'
import { isLoanAbleToTerminate } from '@banx/pages/nftLending/OffersPage'
import {
  HealthColorIncreasing,
  calculateClaimValue,
  calculateFreezeExpiredAt,
  calculateRepaymentCallLenderReceivesAmount,
  getColorByPercent,
  isFreezeLoan,
  isLoanListed,
  isLoanRepaymentCallActive,
} from '@banx/utils'

import { ActionsCell, ClaimCell, StatusCell } from './TableCells'
import { LoanOptimistic } from './loansState'

import styles from './LoansTable.module.less'

interface GetTableColumnsProps {
  findLoanInSelection: (loanPubkey: string) => LoanOptimistic | null
  toggleLoanInSelection: (loan: core.Loan) => void
  onSelectAll: () => void

  hasSelectedLoans: boolean
  isCardView: boolean
}

export const getTableColumns = ({
  findLoanInSelection,
  toggleLoanInSelection,
  onSelectAll,
  hasSelectedLoans,
  isCardView,
}: GetTableColumnsProps) => {
  const columns: ColumnType<core.Loan>[] = [
    {
      key: 'collateral',
      title: (
        <div className={styles.headerTitleRow}>
          <Checkbox className={styles.checkbox} onChange={onSelectAll} checked={hasSelectedLoans} />
          <HeaderCell label="Collateral" align="left" />
        </div>
      ),
      render: (loan) => {
        const { partnerPoints = 0, playerPoints = 0, name, imageUrl } = loan.nft.meta

        const canSelect = isLoanAbleToTerminate(loan) && !isLoanListed(loan)
        const selected = canSelect ? !!findLoanInSelection(loan.publicKey) : undefined

        return (
          <NftInfoCell
            key={loan.publicKey}
            nftName={name}
            nftImage={imageUrl}
            selected={selected}
            onCheckboxClick={() => toggleLoanInSelection(loan)}
            banxPoints={{ partnerPoints, playerPoints }}
            checkboxClassName={!canSelect ? styles.nftCellCheckbox : ''}
            rightContentJSX={createRightContentJSX(loan)}
          />
        )
      },
    },
    {
      key: 'rarity',
      title: <HeaderCell label="Rarity" />,
      render: ({ nft }) => <RarityCell rarity={nft?.rarity || undefined} />,
    },
    {
      key: 'interest',
      title: (
        <HeaderCell
          label="Claim"
          tooltipText="Sum of lent amount and accrued interest to date, less any repayments"
        />
      ),
      render: (loan) => <ClaimCell loan={loan} />,
    },
    {
      key: 'ltv',
      title: <HeaderCell label="Ltv" />,
      render: (loan) => {
        const ltv = (calculateClaimValue(loan) / loan.nft.collectionFloor) * 100
        return (
          <HorizontalCell
            textColor={getColorByPercent(ltv, HealthColorIncreasing)}
            value={createPercentValueJSX(ltv, '0%')}
          />
        )
      },
    },
    {
      key: 'repaid',
      title: (
        <HeaderCell
          label="Repaid"
          tooltipText="Repayments returned to pending offer if open, or wallet if closed"
        />
      ),
      render: ({ totalRepaidAmount = 0 }) => (
        <HorizontalCell value={<DisplayValue value={totalRepaidAmount} />} />
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
      key: 'status',
      title: (
        <HeaderCell
          label="Status"
          tooltipText="Current status and duration of the loan that has been passed"
        />
      ),
      render: (loan) => <StatusCell loan={loan} isCardView={isCardView} />,
    },
    {
      key: 'actionsCell',
      title: !isCardView ? <HeaderCell label="" /> : undefined,
      render: (loan) => <ActionsCell loan={loan} isCardView={isCardView} />,
    },
  ]

  return columns
}

const createRightContentJSX = (loan: core.Loan) => {
  const repaymentCallLenderReceives = calculateRepaymentCallLenderReceivesAmount(loan)
  const freezeExpiredAt = calculateFreezeExpiredAt(loan)

  const repaymentCallContent = createTooltipContent({
    icon: <Coin />,
    content: (
      <p className={styles.repaymentCallTooltipValue}>
        <DisplayValue value={repaymentCallLenderReceives} /> requested
      </p>
    ),
  })

  const freezeLoanContent = createTooltipContent({
    icon: <Snowflake className={styles.snowflakeIcon} />,
    content: (
      <p>
        <Timer expiredAt={freezeExpiredAt} /> until the end of non termination period
      </p>
    ),
  })

  if (isLoanRepaymentCallActive(loan) && isFreezeLoan(loan)) {
    return (
      <div className={styles.iconsTooltipWrapper}>
        {repaymentCallContent}
        {freezeLoanContent}
      </div>
    )
  }

  if (isLoanRepaymentCallActive(loan)) return repaymentCallContent
  if (isFreezeLoan(loan)) return freezeLoanContent

  return ''
}

interface CreateTooltipContentProps {
  content: ReactNode
  icon: ReactNode
}

const createTooltipContent: FC<CreateTooltipContentProps> = ({ content, icon }) => (
  <Tooltip className={styles.iconTooltipContent} title={content}>
    {icon}
  </Tooltip>
)
