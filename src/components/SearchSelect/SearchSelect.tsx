import { Select as AntdSelect } from 'antd'
import classNames from 'classnames'

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
  ...props
}: SearchSelectProps<P>) => {
  const {
    containerRef,
    isPopupOpen,
    defaultOpen,
    handleDropdownVisibleChange,
    handleInputChange,
    showSufixIcon,
    showCollapsedContent,
    inputValue,
  } = useSearchSelect({ onChangeCollapsed, selectedOptions, collapsed })

  if (showCollapsedContent)
    return (
      <CollapsedContent
        selectedOptions={selectedOptions}
        onClick={() => onChangeCollapsed?.(!collapsed)}
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
        inputValue={inputValue}
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
        defaultOpen={defaultOpen}
        maxTagCount="responsive"
        dropdownRender={(menu) => (
          <>
            <SelectLabels labels={labels} />
            {menu}
          </>
        )}
        {...props}
      >
        {options.map((option) =>
          renderOption({ option, optionKeys, selectedOptions, index, optionClassNameProps }),
        )}
      </AntdSelect>
    </div>
  )
}
