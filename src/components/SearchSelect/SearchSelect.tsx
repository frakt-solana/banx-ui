import { useState } from 'react'

import { Select as AntdSelect } from 'antd'
import classNames from 'classnames'

import { CloseModal } from '@banx/icons'

import { PrefixInput, SelectLabels, SuffixIcon, renderOption } from './components'
import { filterOption, getPopupContainer } from './helpers'
import { OptionKeys } from './types'

import styles from './SearchSelect.module.less'

export interface SearchSelectProps<P> {
  options: P[]
  optionKeys: OptionKeys
  selectedOptions: string[]
  onChange?: (selectedOptions: string[]) => void

  labels?: string[]
  placeholder?: string
  className?: string
}

export const SearchSelect = <P extends object>({
  options = [],
  optionKeys,
  placeholder = 'Search',
  onChange,
  selectedOptions,
  labels,
  className,
  ...props
}: SearchSelectProps<P>) => {
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)

  const handleDropdownVisibleChange = (visible: boolean) => {
    setIsPopupOpen(visible)
  }

  return (
    <div className={classNames(styles.selectWrapper, className)}>
      <PrefixInput />
      <AntdSelect
        mode="multiple"
        value={selectedOptions}
        onChange={onChange}
        allowClear
        showSearch
        filterOption={filterOption}
        placeholder={placeholder}
        notFoundContent={null}
        rootClassName="rootSelectClassName"
        popupClassName="rootSelectPopupClassName"
        getPopupContainer={getPopupContainer}
        clearIcon={<CloseModal />}
        suffixIcon={!selectedOptions?.length && <SuffixIcon isPopupOpen={isPopupOpen} />}
        onDropdownVisibleChange={handleDropdownVisibleChange}
        dropdownRender={(menu) => (
          <>
            <SelectLabels labels={labels} />
            {menu}
          </>
        )}
        {...props}
      >
        {options.map((option) => renderOption({ option, optionKeys, selectedOptions }))}
      </AntdSelect>
    </div>
  )
}
