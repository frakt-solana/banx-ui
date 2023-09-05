import { useState } from 'react'

import { RBOption, RadioButton } from '@banx/components/RadioButton'
import { Toggle } from '@banx/components/Toggle'

import { RADIO_BUTTONS_OPTIONS } from './constants'

import styles from './ActivityTable.module.less'

export const FilterTableSection = () => {
  const [selectedOption, setSelectedOption] = useState(RADIO_BUTTONS_OPTIONS[0])
  const [checked, setChecked] = useState(false)

  const handleOptionChange = (newOption: RBOption) => {
    setSelectedOption(newOption)
  }

  return (
    <div className={styles.filterTableSection}>
      <RadioButton
        options={RADIO_BUTTONS_OPTIONS}
        currentOption={selectedOption}
        onOptionChange={handleOptionChange}
      />
      <Toggle label="Mine" checked={checked} onChange={() => setChecked(!checked)} />
    </div>
  )
}
