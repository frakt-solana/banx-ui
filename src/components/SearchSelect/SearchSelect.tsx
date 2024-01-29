import { useMemo } from 'react'

import { Select as AntdSelect } from 'antd'
import classNames from 'classnames'
import { orderBy } from 'lodash'

import { CloseModal } from '@banx/icons'

import {
  CollapsedContent,
  OptionClassNameProps,
  PrefixInput,
  SelectLabels,
  SuffixIcon,
  renderOption,
} from './components'
import { getPopupContainer } from './helpers'
import { useSearchSelect } from './hooks'
import { OptionKeys } from './types'

import styles from './SearchSelect.module.less'

export interface SearchSelectProps<P> {
  options: P[]
  optionKeys: OptionKeys
  selectedOptions: string[]
  onChange?: (selectedOptions: string[]) => void
  onChangeCollapsed?: (value: boolean) => void

  optionClassNameProps?: OptionClassNameProps
  collapsed?: boolean
  labels?: string[]
  placeholder?: string
  className?: string

  sortOrder?: 'asc' | 'desc'
}

export const SearchSelect = <P extends object>({
  options = [],
  optionKeys,
  placeholder = 'Search',
  onChange,
  selectedOptions,
  labels,
  className,
  collapsed,
  onChangeCollapsed,
  optionClassNameProps,
  sortOrder = 'desc',
  ...props
}: SearchSelectProps<P>) => {
  const {
    containerRef,
    isPopupOpen,
    handleDropdownVisibleChange,
    handleInputChange,
    showSufixIcon,
    showCollapsedContent,
    inputValue,
  } = useSearchSelect({ onChangeCollapsed, selectedOptions, collapsed })

  const sortedOptions = useMemo(() => {
    const field = optionKeys.secondLabel?.key
    return orderBy(options, field, sortOrder)
  }, [options])

  if (showCollapsedContent)
    return (
      <CollapsedContent
        selectedOptions={selectedOptions}
        onClick={() => {
          onChangeCollapsed?.(!collapsed)
          handleDropdownVisibleChange(!collapsed)
        }}
      />
    )

  return (
    <div
      ref={containerRef}
      className={classNames(styles.selectWrapper, { [styles.active]: isPopupOpen }, className)}
    >
      <PrefixInput />
      <AntdSelect
        mode="multiple"
        searchValue={inputValue}
        value={selectedOptions}
        onChange={onChange}
        allowClear
        showSearch
        placeholder={placeholder}
        notFoundContent={null}
        rootClassName="rootSelectClassName"
        popupClassName="rootSelectPopupClassName"
        getPopupContainer={getPopupContainer}
        clearIcon={<CloseModal />}
        suffixIcon={showSufixIcon && <SuffixIcon isPopupOpen={isPopupOpen} />}
        onSearch={handleInputChange}
        onDropdownVisibleChange={handleDropdownVisibleChange}
        maxTagCount="responsive"
        dropdownRender={(menu) => (
          <>
            <SelectLabels labels={labels} />
            {menu}
          </>
        )}
        {...props}
      >
        {sortedOptions.map((option, index) =>
          renderOption({ option, optionKeys, selectedOptions, index, optionClassNameProps }),
        )}
      </AntdSelect>
    </div>
  )
}
