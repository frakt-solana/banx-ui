import { ChangeEvent, FC, useMemo, useRef, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { SolanaFMLink } from '@banx/components/SolanaLinks'
import { NumericStepInput } from '@banx/components/inputs'
import { Input, InputProps } from '@banx/components/inputs/Input'

import { useOnClickOutside } from '@banx/hooks'
import { ChevronDown, CloseModal, Wallet } from '@banx/icons'
import { shortenAddress } from '@banx/utils'

import { MockTokenMetaType } from '../../constants'

import styles from './InputTokenSelect.module.less'

interface InputTokenSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  className?: string

  selectedToken: MockTokenMetaType
  tokenList: MockTokenMetaType[]
  onChangeToken: (option: MockTokenMetaType) => void

  maxValue?: string
}

const InputTokenSelect: FC<InputTokenSelectProps> = ({
  label,
  value,
  onChange,
  className,
  selectedToken,
  tokenList,
  onChangeToken,
  maxValue = '0',
}) => {
  const { connected } = useWallet()

  const [visible, setVisible] = useState(false)

  const handleClick = () => {
    setVisible(!visible)
  }

  return (
    <div className={classNames(styles.inputTokenSelectWrapper, className)}>
      <div className={styles.inputTokenSelectHeader}>
        <div className={styles.inputTokenSelectLabel}>{label}</div>
        {connected && <ControlsButtons maxValue={maxValue} onChange={onChange} />}
      </div>
      <div className={styles.inputTokenSelect}>
        <NumericStepInput
          value={value}
          onChange={onChange}
          placeholder="0"
          className={styles.numericStepInput}
        />

        <SelectTokenButton onClick={handleClick} selectedToken={selectedToken} />

        {visible && (
          <SearchSelect
            options={tokenList}
            onChangeToken={onChangeToken}
            onClose={() => setVisible(false)}
          />
        )}
      </div>
    </div>
  )
}

export default InputTokenSelect

interface ControlsButtonsProps {
  onChange: (value: string) => void
  maxValue?: string
}

const ControlsButtons: FC<ControlsButtonsProps> = ({ onChange, maxValue = '0' }) => {
  const onMaxClick = () => onChange(maxValue)
  const onHalfClick = () => onChange((parseFloat(maxValue) / 2).toString())

  return (
    <div className={styles.inputTokenSelectControlButtons}>
      <div className={styles.inputTokenSelectMaxValue}>
        <Wallet /> {formatNumber(parseFloat(maxValue))}
      </div>

      <Button onClick={onHalfClick} variant="secondary" size="small">
        Half
      </Button>
      <Button onClick={onMaxClick} variant="secondary" size="small">
        Max
      </Button>
    </div>
  )
}

interface SelectTokenButtonProps {
  selectedToken: MockTokenMetaType
  onClick: () => void
}

const SelectTokenButton: FC<SelectTokenButtonProps> = ({ selectedToken, onClick }) => {
  const { ticker, imageUrl } = selectedToken

  return (
    <div onClick={onClick} className={styles.selectTokenButton}>
      <img src={imageUrl} className={styles.selectTokenButtonIcon} />
      {ticker}
      <ChevronDown className={styles.selectTokenButtonChevronIcon} />
    </div>
  )
}

interface SearchSelectProps {
  options: MockTokenMetaType[]
  onChangeToken: (token: MockTokenMetaType) => void
  onClose: () => void
}

const SearchSelect: FC<SearchSelectProps> = ({ options, onChangeToken, onClose }) => {
  const [searchInput, setSearchInput] = useState('')

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value)
  }

  const handleChangeToken = (token: MockTokenMetaType) => {
    onChangeToken(token)
    onClose()
  }

  const filteredOptions = useMemo(() => {
    return options.filter((option) =>
      option.ticker.toLowerCase().includes(searchInput.toLowerCase()),
    )
  }, [options, searchInput])

  const dropdownRef = useRef(null)
  useOnClickOutside(dropdownRef, onClose)

  return (
    <div className={styles.searchSelect} ref={dropdownRef}>
      <SearchInput
        value={searchInput}
        onChange={handleSearchInputChange}
        placeholder="Search token"
        onClose={onClose}
      />

      <div className={styles.selectTokenDropdown}>
        <div className={styles.selectTokenDropdownHeader}>
          <span>Token</span>
          <span>Available</span>
        </div>
        <div className={styles.selectTokenDropdownList}>
          {filteredOptions.map((option, index) => (
            <div
              key={option.mint}
              onClick={() => handleChangeToken(option)}
              className={classNames(styles.dropdownItem, { [styles.highlight]: index % 2 === 0 })}
            >
              <div className={styles.dropdownItemMainInfo}>
                <img className={styles.dropdownItemIcon} src={option.imageUrl} />
                <div className={styles.dropdownItemInfo}>
                  <span className={styles.dropdownItemTicker}>{option.ticker}</span>
                  <span className={styles.dropdownItemAddress}>{shortenAddress(option.mint)}</span>
                </div>
                <SolanaFMLink path={`address/${option.mint}`} size="small" />
              </div>
              <span className={styles.dropdownItemAdditionalInfo}>{option.available}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface SearchInputProps extends InputProps {
  onClose: () => void
}

const SearchInput: FC<SearchInputProps> = ({ onClose, ...inputProps }) => {
  return (
    <div className={styles.searchInputWrapper}>
      <Input className={styles.searchInput} {...inputProps} />
      <CloseModal onClick={onClose} className={styles.searchInputCloseIcon} />
    </div>
  )
}

const formatNumber = (value = 0) => {
  if (!value) return '0'

  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}