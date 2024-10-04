import { FC, useMemo } from 'react'

import { RBOption, RadioButton } from '@banx/components/RadioButton'

import { TokenLoan } from '@banx/api/tokens'
import { isTokenLoanRepaymentCallActive, isTokenLoanTerminating } from '@banx/utils'

import styles from './ExpandedCardContent.module.less'

interface FilterTableSectionProps {
  loans: TokenLoan[]
  onChange: (option: RBOption) => void
  currentOption: RBOption | undefined
}

export enum FilterStatus {
  ALL = 'all',
  TERMINATING = 'terminating',
  REPAYMENT_CALL = 'repaymentCall',
}

export const FilterTableSection: FC<FilterTableSectionProps> = ({
  loans,
  onChange,
  currentOption,
}) => {
  const isTerminateDisabled = useMemo(() => !loans.some(isTokenLoanTerminating), [loans])
  const isRepaymentCallDisabled = useMemo(
    () => !loans.some(isTokenLoanRepaymentCallActive),
    [loans],
  )

  const options = useMemo(
    () => [
      {
        label: 'All',
        value: FilterStatus.ALL,
      },
      {
        label: 'Terminating',
        value: FilterStatus.TERMINATING,
        disabled: isTerminateDisabled,
      },
      {
        label: 'Repayment call',
        value: FilterStatus.REPAYMENT_CALL,
        disabled: isRepaymentCallDisabled,
      },
    ],
    [isTerminateDisabled, isRepaymentCallDisabled],
  )

  return (
    <div className={styles.filterTableSection}>
      <RadioButton
        options={options}
        currentOption={currentOption ?? options[0]}
        onOptionChange={onChange}
        className={styles.radioButton}
      />
    </div>
  )
}
