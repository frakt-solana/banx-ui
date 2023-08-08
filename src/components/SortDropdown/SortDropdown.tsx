import { FC, useRef, useState } from 'react'

import classNames from 'classnames'

import { useOnClickOutside } from '@banx/hooks'

import { DropdownButton, SortOptions } from './components'

import styles from './SortDropdown.module.less'

export type SortOption = {
  label: string
  value: string
}

export interface SortDropdownProps {
  option: SortOption
  onChange: (option: SortOption) => void
  options: SortOption[]
  className?: string
  dropdownClassName?: string
}

export const SortDropdown: FC<SortDropdownProps> = ({
  option,
  onChange,
  options,
  className,
  dropdownClassName,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)

  const dropdownRef = useRef<HTMLDivElement | null>(null)
  useOnClickOutside(dropdownRef, () => setIsDropdownOpen(false))

  const toggleDropdown = () => {
    setIsDropdownOpen((prevOpen) => !prevOpen)
  }

  const handleChangeSort = (sortOrder: string, label: string) => {
    const newSortOption = { value: sortOrder, label }
    onChange(newSortOption)
  }

  return (
    <div ref={dropdownRef} className={classNames(styles.sortDropdownWrapper, className)}>
      <DropdownButton sortOption={option} toggleDropdown={toggleDropdown} />
      {isDropdownOpen && (
        <div className={classNames(styles.dropdown, dropdownClassName)}>
          <SortOptions sortOption={option} options={options} onChange={handleChangeSort} />
        </div>
      )}
    </div>
  )
}
