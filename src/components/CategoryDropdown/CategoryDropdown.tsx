import { FC, useRef, useState } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'

import { MarketCategory } from '@banx/api/tokens'
import { useOnClickOutside } from '@banx/hooks'
import { ChevronDown, Filter as FilterIcon } from '@banx/icons'

import styles from './CategoryDropdown.module.less'

interface CategoryDropdownProps {
  options?: { key: MarketCategory; label: string }[]
  selectedOption: MarketCategory
  onChange: (category: MarketCategory) => void
  className?: string
}

const CategoryDropdown: FC<CategoryDropdownProps> = ({
  selectedOption,
  options = MARKETS_CATEGORIES,
  onChange,
  className,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)

  const dropdownRef = useRef(null)
  useOnClickOutside(dropdownRef, () => setIsDropdownOpen(false))

  const toggleDropdown = () => {
    setIsDropdownOpen((prevOpen) => !prevOpen)
  }

  return (
    <div className={classNames(styles.dropdownContainer, className)} ref={dropdownRef}>
      <Button
        type="circle"
        variant="tertiary"
        className={classNames(styles.dropdownButton, { [styles.isOpen]: isDropdownOpen })}
        onClick={toggleDropdown}
      >
        <div className={styles.dropdownButtonTextContainer}>
          <FilterIcon />
          <span>{selectedOption}</span>
        </div>

        <ChevronDown
          className={classNames(styles.chevronIcon, { [styles.rotate]: isDropdownOpen })}
        />
      </Button>

      {isDropdownOpen && (
        <div className={styles.dropdown}>
          {options.map((tokenOption) => (
            <Button
              key={tokenOption.key}
              type="circle"
              variant="tertiary"
              onClick={() => onChange(tokenOption.key)}
              className={classNames(styles.dropdownItem, {
                [styles.active]: selectedOption === tokenOption.key,
              })}
            >
              {tokenOption.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

export default CategoryDropdown

export const MARKETS_CATEGORIES = [
  { key: MarketCategory.All, label: 'All' },
  { key: MarketCategory.LST, label: 'LST' },
  { key: MarketCategory.DeFi, label: 'DeFi' },
  { key: MarketCategory.Meme, label: 'Memes' },
  { key: MarketCategory.Governance, label: 'Governance' },
  { key: MarketCategory.RWA, label: 'RWA' },
  { key: MarketCategory.LP, label: 'LP' },
  { key: MarketCategory.DePin, label: 'DePin' },
  { key: MarketCategory.Gaming, label: 'Gaming' },
]
