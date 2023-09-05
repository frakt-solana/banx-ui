import { useState } from 'react'

import { RBOption, RadioButton } from '@banx/components/RadioButton'

import { RADIO_BUTTONS_OPTIONS } from './constants'

import styles from './ActivityTable.module.less'

export const FilterTableSection = () => {
  const [selectedOption, setSelectedOption] = useState(RADIO_BUTTONS_OPTIONS[0])

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
    </div>
  )
}
