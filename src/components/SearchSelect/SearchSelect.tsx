import { MinusOutlined } from '@ant-design/icons'
import { Select as AntdSelect, SelectProps } from 'antd'
import classNames from 'classnames'

import { OptionKeys, renderOption } from './Option'
import { PrefixInput, SelectLabels } from './components'
import { filterOption, getPopupContainer } from './helpers'

import styles from './SearchSelect.module.less'

export interface SearchSelectProps<T extends SelectProps<T>> {
  options?: any[]
  loading?: boolean
  optionKeys: OptionKeys
  placeholder?: string
  onChange?: any
  selectedOptions: string[]
  labels?: string[]
  className?: string
}

export const SearchSelect = <T extends object>({
  options = [],
  optionKeys,
  placeholder = 'Search',
  onChange,
  selectedOptions,
  labels,
  className,
  ...props
}: SearchSelectProps<T>) => {
  return (
    <div className={classNames(styles.selectWrapper, className)}>
      <PrefixInput />
      <AntdSelect
        mode="multiple"
        value={selectedOptions as any}
        onChange={onChange as any}
        allowClear
        showSearch
        filterOption={filterOption}
        placeholder={placeholder}
        notFoundContent={null}
        rootClassName="rootSelectClassName"
        popupClassName="rootSelectPopupClassName"
        getPopupContainer={getPopupContainer}
        removeIcon={<MinusOutlined />}
        clearIcon={<MinusOutlined />}
        dropdownRender={(menu) => (
          <>
            <SelectLabels labels={labels} />
            {menu}
          </>
        )}
        {...props}
      >
        {options.map((option: any) => renderOption({ option, optionKeys, selectedOptions }))}
      </AntdSelect>
    </div>
  )
}
