import { ChangeEvent, FC, useMemo, useRef, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { Skeleton } from 'antd'
import classNames from 'classnames'
import { BN } from 'fbonds-core'

import { Button } from '@banx/components/Buttons'
import { SolanaFMLink } from '@banx/components/SolanaLinks'
import { NumericStepInput } from '@banx/components/inputs'
import { Input, InputProps } from '@banx/components/inputs/Input'

import { core } from '@banx/api/tokens'
import { useOnClickOutside } from '@banx/hooks'
import { ChevronDown, CloseModal, Wallet } from '@banx/icons'
import { bnToHuman, limitDecimalPlaces, shortenAddress, stringToBN } from '@banx/utils'

import styles from './InputTokenSelect.module.less'

interface BaseToken {
  collateral: core.TokenMeta
  amountInWallet: number
}

interface InputTokenSelectProps<T extends BaseToken> {
  label: string
  value: string
  onChange: (value: string) => void
  className?: string
  selectedToken: T
  tokenList: T[]
  onChangeToken: (option: T) => void
  disabledInput?: boolean
  maxValue?: number //? (e.g. 1e6 for 1 USDC, 1e9 for 1 SOL)
  showControls?: boolean
}

const InputTokenSelect = <T extends BaseToken>({
  label,
  value,
  onChange,
  className,
  selectedToken,
  tokenList,
  onChangeToken,
  disabledInput,
  maxValue,
  showControls = false,
}: InputTokenSelectProps<T>) => {
  const [visible, setVisible] = useState(false)

  const handleClick = () => {
    setVisible(!visible)
  }

  return (
    <div className={classNames(styles.inputTokenSelectWrapper, className)}>
      <div className={styles.inputTokenSelectHeader}>
        <div className={styles.inputTokenSelectLabel}>{label}</div>
        {showControls && (
          <ControlsButtons
            maxValue={maxValue}
            onChange={onChange}
            decimals={selectedToken.collateral.decimals}
          />
        )}
      </div>
      <div className={styles.inputTokenSelect}>
        <NumericStepInput
          value={getFormattedInputValue(value)}
          onChange={onChange}
          placeholder="0"
          className={styles.numericStepInput}
          disabled={disabledInput}
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
  maxValue?: number
  decimals: number
}

const ControlsButtons: FC<ControlsButtonsProps> = ({ onChange, maxValue = 0, decimals }) => {
  const maxValueStr = String(maxValue / Math.pow(10, decimals))

  const onMaxClick = () => {
    onChange(limitDecimalPlaces(maxValueStr))
  }

  const onHalfClick = () => {
    const nextValue = bnToHuman(stringToBN(maxValueStr).div(new BN(2)))
    onChange(limitDecimalPlaces(nextValue.toString()))
  }

  return (
    <div className={styles.inputTokenSelectControlButtons}>
      <div className={styles.inputTokenSelectMaxValue}>
        <Wallet /> {formatNumber(parseFloat(maxValueStr))}
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

interface SelectTokenButtonProps<T extends BaseToken> {
  selectedToken: T
  onClick: () => void
}

const SelectTokenButton = <T extends BaseToken>({
  selectedToken,
  onClick,
}: SelectTokenButtonProps<T>) => {
  const { ticker, logoUrl } = selectedToken.collateral

  return (
    <div onClick={onClick} className={styles.selectTokenButton}>
      <img src={logoUrl} className={styles.selectTokenButtonIcon} />
      {ticker}
      <ChevronDown className={styles.selectTokenButtonChevronIcon} />
    </div>
  )
}

interface SearchSelectProps<T extends BaseToken> {
  options: T[]
  onChangeToken: (token: T) => void
  onClose: () => void
}

const SearchSelect = <T extends BaseToken>({
  options,
  onChangeToken,
  onClose,
}: SearchSelectProps<T>) => {
  const { connected } = useWallet()

  const [searchInput, setSearchInput] = useState('')

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value)
  }

  const handleChangeToken = (token: T) => {
    onChangeToken(token)
    onClose()
  }

  const filteredOptions = useMemo(() => {
    return options.filter((option) =>
      option.collateral.ticker.toLowerCase().includes(searchInput.toLowerCase()),
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
          {connected && <span>Available</span>}
        </div>
        <div className={styles.selectTokenDropdownList}>
          {filteredOptions.map((option, index) => (
            <div
              key={option.collateral.mint}
              onClick={() => handleChangeToken(option)}
              className={classNames(styles.dropdownItem, { [styles.highlight]: index % 2 === 0 })}
            >
              <div className={styles.dropdownItemMainInfo}>
                <img className={styles.dropdownItemIcon} src={option.collateral.logoUrl} />
                <div className={styles.dropdownItemInfo}>
                  <span className={styles.dropdownItemTicker}>{option.collateral.ticker}</span>
                  <span className={styles.dropdownItemAddress}>
                    {shortenAddress(option.collateral.mint)}
                  </span>
                </div>
                <SolanaFMLink path={`address/${option.collateral.mint}`} size="small" />
              </div>

              {connected && (
                <span className={styles.dropdownItemAdditionalInfo}>
                  {option.amountInWallet / Math.pow(10, option.collateral.decimals)}
                </span>
              )}
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

interface SkeletonInputTokenSelectProps {
  label: string
  className?: string
}
export const SkeletonInputTokenSelect: FC<SkeletonInputTokenSelectProps> = ({
  label,
  className,
}) => {
  return (
    <div className={classNames(styles.inputTokenSelectWrapper, className)}>
      <div className={styles.inputTokenSelectHeader}>
        <div className={styles.inputTokenSelectLabel}>{label}</div>
        <Skeleton.Input size="small" />
      </div>
      <div className={styles.inputTokenSelect}>
        <Skeleton.Input className={styles.skeletonInputTokenSelect} />
      </div>
    </div>
  )
}

/**
 * Converts a numeric string to an empty string if the value is 0, otherwise returns the original value.
 */
const getFormattedInputValue = (inputValue: string) => {
  return parseFloat(inputValue) === 0 ? '' : inputValue
}
