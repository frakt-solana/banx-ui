import { FC, useCallback, useMemo } from 'react'

import Table from '@banx/components/Table'

import { TokenLoan } from '@banx/api/tokens'
import { useTokenType } from '@banx/store/common'
import { isTokenLoanRepaymentCallActive, isTokenLoanTerminating } from '@banx/utils'

import Summary from '../../../LoansTokenActiveTable/Summary'
import { getTableColumns } from '../../../LoansTokenActiveTable/columns'

import styles from './ExpandedCardContent.module.less'

interface ExpandedCardContentProps {
  loans: TokenLoan[]
}

const ExpandedCardContent: FC<ExpandedCardContentProps> = ({ loans }) => {
  const { tokenType } = useTokenType()

  const onRowClick = useCallback(() => {
    return
  }, [])

  const columns = getTableColumns({
    onSelectAll: () => null,
    findLoanInSelection: () => null,
    toggleLoanInSelection: onRowClick,
    hasSelectedLoans: false,
    tokenType,
  })

  const rowParams = useMemo(() => {
    return {
      onRowClick,
      activeRowParams: [
        {
          condition: isTokenLoanTerminating,
          className: styles.terminated,
          cardClassName: styles.terminated,
        },
        {
          condition: isTokenLoanRepaymentCallActive,
          className: styles.repaymentCallActive,
          cardClassName: styles.repaymentCallActive,
        },
      ],
    }
  }, [onRowClick])

  return (
    <>
      <Table
        data={loans}
        columns={columns}
        rowParams={rowParams}
        className={styles.table}
        classNameTableWrapper={styles.tableWrapper}
      />
      <Summary loans={loans} selectedLoans={[]} setSelection={() => null} />
    </>
  )
}

export default ExpandedCardContent
