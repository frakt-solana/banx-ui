import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { RBOption, RadioButton } from '@banx/components/RadioButton'
import { Toggle } from '@banx/components/Toggle'

import styles from './LendTokenActivityTable.module.less'

interface FilterTableSectionProps {
  checked: boolean
  onToggleChecked: () => void
  currentOption: RBOption
  onOptionChange: (value: RBOption) => void
  options: RBOption[]
  isRadioButtonDisabled: boolean
  isToggleDisabled: boolean
}

export const FilterTableSection: FC<FilterTableSectionProps> = ({
  checked,
  onToggleChecked,
  currentOption,
  onOptionChange,
  options,
  isRadioButtonDisabled,
  isToggleDisabled,
}) => {
  const { connected } = useWallet()

  return (
    <div className={styles.filterTableSection}>
      <RadioButton
        className={styles.radioButton}
        options={options}
        currentOption={currentOption}
        onOptionChange={onOptionChange}
        disabled={isRadioButtonDisabled}
      />
      {connected && (
        <Toggle
          label="Mine"
          checked={checked}
          onChange={onToggleChecked}
          disabled={isToggleDisabled}
        />
      )}
    </div>
  )
}
