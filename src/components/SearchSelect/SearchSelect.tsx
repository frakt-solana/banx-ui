import { Select as AntdSelect } from 'antd'
import classNames from 'classnames'

import { CloseModal } from '@banx/icons'

import { CollapsedContent, PrefixInput, SelectLabels, SuffixIcon, renderOption } from './components'
import { filterOption, getPopupContainer } from './helpers'
import { useSearchSelect } from './hooks'
import { OptionKeys } from './types'

import styles from './SearchSelect.module.less'

export interface SearchSelectProps<P> {
  options: P[]
  optionKeys: OptionKeys<P>
  selectedOptions: string[]
  onChange?: (selectedOptions: string[]) => void
  onChangeCollapsed?: (value: boolean) => void

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
  } = useSearchSelect({ onChangeCollapsed, selectedOptions, collapsed })

  if (showCollapsedContent)
    return (
      <CollapsedContent
        selectedOptions={selectedOptions}
        onClick={() => onChangeCollapsed?.(!collapsed)}
      />
    )

  return (
    <div ref={containerRef} className={classNames(styles.selectWrapper, className)}>
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
        suffixIcon={showSufixIcon && <SuffixIcon isPopupOpen={isPopupOpen} />}
        onSearch={handleInputChange}
        onDropdownVisibleChange={handleDropdownVisibleChange}
        defaultOpen={defaultOpen}
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
