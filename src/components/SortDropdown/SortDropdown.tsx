import { useRef, useState } from 'react'

import classNames from 'classnames'

import { useOnClickOutside } from '@banx/hooks'

import { DropdownButton, SortOptions } from './components'

import styles from './SortDropdown.module.less'

export type SortOrder = 'asc' | 'desc'
export type SortOption<T> = { label: string; value: [T, SortOrder] }

export interface SortDropdownProps<T> {
  option: SortOption<T>
  onChange: (option: SortOption<T>) => void
  options: SortOption<T>[]
  className?: string
}

export const SortDropdown = <T extends object>({
  option,
  onChange,
  options,
  className,
}: SortDropdownProps<T>) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)

  const dropdownRef = useRef(null)
  useOnClickOutside(dropdownRef, () => setIsDropdownOpen(false))

  const toggleDropdown = () => {
    setIsDropdownOpen((prevOpen) => !prevOpen)
  }

  return (
    <div ref={dropdownRef} className={classNames(styles.sortDropdownWrapper, className)}>
      <DropdownButton
        sortOption={option}
        isDropdownOpen={isDropdownOpen}
        toggleDropdown={toggleDropdown}
      />
      {isDropdownOpen && (
        <div className={styles.dropdown}>
          <SortOptions selectedOption={option} options={options} onChange={onChange} />
        </div>
      )}
    </div>
  )
}
