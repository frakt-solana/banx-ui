import { MinusOutlined } from '@ant-design/icons'
import { Select as AntdSelect } from 'antd'
import classNames from 'classnames'

import { PrefixInput, SelectLabels, renderOption } from './components'
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
        {options.map((option) => renderOption({ option, optionKeys, selectedOptions }))}
      </AntdSelect>
    </div>
  )
}
