import { FC } from 'react'

import { RBOption, RadioButton } from '@banx/components/RadioButton'
import { Toggle } from '@banx/components/Toggle'

import { RADIO_BUTTONS_OPTIONS } from './constants'

import styles from './ActivityTable.module.less'

interface FilterTableSectionProps {
  checked: boolean
  onToggleChecked: () => void
  currentOption: RBOption
  onOptionChange: (value: RBOption) => void
}

export const FilterTableSection: FC<FilterTableSectionProps> = ({
  checked,
  onToggleChecked,
  currentOption,
  onOptionChange,
}) => {
  return (
    <div className={styles.filterTableSection}>
      <RadioButton
        options={RADIO_BUTTONS_OPTIONS}
        currentOption={currentOption}
        onOptionChange={onOptionChange}
      />
      <Toggle label="Mine" checked={checked} onChange={onToggleChecked} />
    </div>
  )
}
