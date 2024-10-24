import { ReactNode, useRef, useState } from 'react'

import classNames from 'classnames'

import { useOnClickOutside } from '@banx/hooks'
import { ChevronDown } from '@banx/icons'

import { Button } from '../Buttons'

import styles from './TokenSwitcher.module.less'

export interface Option<T> {
  key: T
  icon: ReactNode
  label: string
}

export interface TokenDropdownProps<T> {
  option: Option<T>
  options: Option<T>[]
  onChangeToken: (tokenType: T) => void
}

export const TokenDropdown = <T,>({ option, onChangeToken, options }: TokenDropdownProps<T>) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)

  const dropdownRef = useRef(null)
  useOnClickOutside(dropdownRef, () => setIsDropdownOpen(false))

  const toggleDropdown = () => {
    setIsDropdownOpen((prevOpen) => !prevOpen)
  }

  return (
    <div ref={dropdownRef}>
      <TokenDropdownButton option={option} onClick={toggleDropdown} isOpen={isDropdownOpen} />

      {isDropdownOpen && (
        <div className={styles.dropdown}>
          {options.map((tokenOption) => (
            <TokenDropdownItem
              key={tokenOption.label}
              option={tokenOption}
              isActive={tokenOption.key === option.key}
              onClick={() => onChangeToken(tokenOption.key)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface TokenDropdownItemProps<T> {
  option: Option<T>
  isActive: boolean
  onClick: () => void
}
const TokenDropdownItem = <T,>({ option, isActive, onClick }: TokenDropdownItemProps<T>) => {
  const { icon, label } = option

  return (
    <div
      key={label}
      onClick={onClick}
      className={classNames(styles.dropdownItem, {
        [styles.active]: isActive,
      })}
    >
      {icon}
      <span className={styles.dropdownItemLabel}>{label}</span>
    </div>
  )
}

interface TokenDropdownButtonProps<T> {
  onClick: () => void
  isOpen: boolean
  option: Option<T>
}

const TokenDropdownButton = <T,>({ option, onClick, isOpen }: TokenDropdownButtonProps<T>) => {
  const { icon, label } = option

  return (
    <Button
      type="circle"
      variant="tertiary"
      className={classNames(styles.dropdownButton, { [styles.isOpen]: isOpen })}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
      <ChevronDown className={classNames(styles.chevronIcon, { [styles.rotate]: isOpen })} />
    </Button>
  )
}
