import { FC, useCallback, useEffect, useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { filter } from 'lodash'

import { RBOption } from '@banx/components/RadioButton'
import Table from '@banx/components/Table'

import { TokenLoan } from '@banx/api/tokens'
import { useTokenType } from '@banx/store/common'
import { isTokenLoanRepaymentCallActive, isTokenLoanTerminating } from '@banx/utils'

import { getTableColumns } from '../../../LoansTokenActiveTable/columns'
import { useSelectedTokenLoans } from '../../loansCart'
import { FilterStatus, FilterTableSection } from './FilterTableSection'
import { Summary } from './Summary'

import styles from './ExpandedCardContent.module.less'

interface ExpandedCardContentProps {
  loans: TokenLoan[]
}

const ExpandedCardContent: FC<ExpandedCardContentProps> = ({ loans }) => {
  const { publicKey: walletPublicKey } = useWallet()
  const walletPubkey = walletPublicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const {
    selection: selectedLoans,
    toggle: toggleLoanInSelection,
    find,
    clear: clearSelection,
    set: setSelection,
  } = useSelectedTokenLoans()

  //? Clear selection when tokenType changes
  //? To prevent selection transfering from one tokenType to another
  useEffect(() => {
    clearSelection()
  }, [clearSelection, tokenType])

  const walletSelectedLoans = useMemo(() => {
    if (!walletPubkey) return []

    return selectedLoans.filter(({ wallet }) => wallet === walletPubkey)
  }, [selectedLoans, walletPubkey])

  const hasSelectedLoans = !!walletSelectedLoans.length

  const onSelectAll = useCallback(() => {
    if (hasSelectedLoans) {
      return clearSelection()
    }

    return setSelection(loans, walletPubkey)
  }, [clearSelection, hasSelectedLoans, loans, setSelection, walletPubkey])

  const findLoanInSelection = useCallback(
    (loanPubkey: string) => find(loanPubkey, walletPubkey),
    [find, walletPubkey],
  )

  const onRowClick = useCallback(
    (loan: TokenLoan) => toggleLoanInSelection(loan, walletPubkey),
    [toggleLoanInSelection, walletPubkey],
  )

  const columns = getTableColumns({
    findLoanInSelection,
    onSelectAll,
    onRowClick,
    hasSelectedLoans,
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

  const [currentOption, setCurrentOption] = useState<RBOption | undefined>()

  const filteredLoans = useMemo(() => {
    if (!currentOption) return loans

    if (currentOption.value === FilterStatus.TERMINATING) {
      return filter(loans, isTokenLoanTerminating)
    }

    if (currentOption.value === FilterStatus.REPAYMENT_CALL) {
      return filter(loans, isTokenLoanRepaymentCallActive)
    }

    return loans
  }, [currentOption, loans])

  return (
    <>
      <FilterTableSection
        loans={filteredLoans}
        onChange={setCurrentOption}
        currentOption={currentOption}
      />

      <Table
        data={filteredLoans}
        columns={columns}
        rowParams={rowParams}
        className={styles.table}
        classNameTableWrapper={styles.tableWrapper}
      />

      <Summary
        loans={filteredLoans}
        selectedLoansOptimistics={selectedLoans}
        setSelection={setSelection}
      />
    </>
  )
}

export default ExpandedCardContent
