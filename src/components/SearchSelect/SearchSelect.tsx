import { MinusOutlined } from '@ant-design/icons'
import { Select as AntdSelect, SelectProps } from 'antd'
import { DefaultOptionType } from 'antd/es/select'
import classNames from 'classnames'

import { OptionKeys, renderOption } from './Option'
import { PrefixInput, SelectLabels } from './components'
import { filterOption, getPopupContainer } from './helpers'

import styles from './SearchSelect.module.less'

export interface SearchSelectProps<T extends DefaultOptionType> extends SelectProps<T> {
  options?: any[]
  loading?: boolean
  optionKeys: OptionKeys
  placeholder?: string
  onChange?: any
  selectedOptions: string[]
  labels?: string[]
}

export const SearchSelect = <T extends DefaultOptionType>({
  options = [],
  optionKeys,
  placeholder,
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
        open
        {...props}
      >
        {options.map((option: any) => renderOption({ option, optionKeys, selectedOptions }))}
      </AntdSelect>
    </div>
  )
}
