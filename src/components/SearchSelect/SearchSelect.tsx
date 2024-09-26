import { useMemo } from 'react'

import { Select as AntdSelect } from 'antd'
import classNames from 'classnames'
import { orderBy } from 'lodash'

import { CloseModal } from '@banx/icons'

import { OptionClassNameProps, renderOption } from './SelectOption'
import {
  CollapsedContent,
  NotFoundContent,
  PrefixInput,
  SelectLabels,
  SuffixIcon,
} from './components'
import { getPopupContainer } from './helpers'
import { useFavoriteOptions, useSearchSelect } from './hooks'
import { OptionKeys } from './types'

import styles from './SearchSelect.module.less'

export interface SearchSelectProps<P> {
  options: P[]
  labels: string[]
  optionKeys: OptionKeys
  selectedOptions: string[]
  onChange: (selectedOptions: string[]) => void

  /**
    If collapsed is true, SearchSelect will be displayed as a button
    Pass only if SearchSelect needs to have the ability to be displayed as a button
  */
  collapsed?: boolean
  onChangeCollapsed?: (value: boolean) => void
  defaultCollapsed?: boolean

  className?: string
  optionClassNameProps?: OptionClassNameProps

  placeholder?: string
  disabled?: boolean
  favoriteKey?: string
  sortOrder?: 'asc' | 'desc'
}

export const SearchSelect = <P extends object>({
  options = [],
  labels,
  optionKeys,
  selectedOptions,
  onChange,

  collapsed,
  onChangeCollapsed,
  defaultCollapsed,

  className,
  optionClassNameProps,

  placeholder = 'Search',
  disabled = false,
  sortOrder = 'desc',
  favoriteKey = '',
}: SearchSelectProps<P>) => {
  const { toggleFavorite, sortOptionsByFavoriteStatus, isOptionFavorite } =
    useFavoriteOptions<P>(favoriteKey)

  const sortedOptions = useMemo(() => {
    const sortBy = optionKeys.secondLabel?.key
    const sorted = orderBy(options, sortBy, sortOrder)

    return favoriteKey ? sortOptionsByFavoriteStatus(sorted) : sorted
  }, [optionKeys.secondLabel?.key, options, sortOrder, favoriteKey, sortOptionsByFavoriteStatus])

  const {
    containerRef,
    isPopupOpen,
    togglePopupVisible,
    handleInputChange,
    showSufixIcon,
    showCollapsedContent,
    inputValue,
    handleCollapseClick,
  } = useSearchSelect({ onChangeCollapsed, selectedOptions, collapsed, defaultCollapsed })

  if (showCollapsedContent) {
    return <CollapsedContent selectedOptions={selectedOptions} onClick={handleCollapseClick} />
  }

  return (
    <div
      ref={containerRef}
      className={classNames(
        styles.selectWrapper,
        { [styles.active]: isPopupOpen },
        { [styles.disabled]: disabled },
        className,
      )}
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
        notFoundContent={<NotFoundContent />}
        rootClassName="rootSelectClassName"
        popupClassName="rootSelectPopupClassName"
        getPopupContainer={getPopupContainer}
        clearIcon={<CloseModal />}
        suffixIcon={showSufixIcon && <SuffixIcon isPopupOpen={isPopupOpen} disabled={disabled} />}
        onSearch={handleInputChange}
        onDropdownVisibleChange={togglePopupVisible}
        maxTagCount="responsive"
        transitionName="" //? Remove all animations
        dropdownRender={(menu) => (
          <>
            <SelectLabels labels={labels} />
            {menu}
          </>
        )}
      >
        {sortedOptions.map((option, index) =>
          renderOption({
            option,
            optionKeys,
            selectedOptions,
            index,
            optionClassNameProps,
            toggleFavorite: favoriteKey ? () => toggleFavorite(option) : undefined,
            isOptionFavorite: isOptionFavorite(option),
          }),
        )}
      </AntdSelect>
    </div>
  )
}
