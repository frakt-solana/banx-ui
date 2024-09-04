import { FC } from 'react'

import { Skeleton } from 'antd'
import classNames from 'classnames'
import { BN } from 'fbonds-core'

import { Button } from '@banx/components/Buttons'
import NumericInput from '@banx/components/inputs/NumericInput'

import { core } from '@banx/api/tokens'
import { ChevronDown, Wallet } from '@banx/icons'
import { useModal } from '@banx/store/common'
import { bnToHuman, limitDecimalPlaces, stringToBN } from '@banx/utils'

import ModalTokenSelect from '../ModalTokenSelect'

import styles from './InputTokenSelect.module.less'

interface BaseToken {
  collateral: core.TokenMeta
  amountInWallet: number
}

interface InputTokenSelectProps<T extends BaseToken> {
  label: string
  value: string
  onChange: (value: string) => void

  selectedToken: T | undefined
  tokensList: T[]
  onChangeToken: (option: T) => void

  className?: string
  disabled?: boolean
  maxValue?: number //? (e.g. 1e6 for 1 USDC, 1e9 for 1 SOL)
  showControls?: boolean
}

const InputTokenSelect = <T extends BaseToken>({
  label,
  value,
  onChange,
  className,
  selectedToken,
  tokensList,
  onChangeToken,
  disabled,
  maxValue,
  showControls = false,
}: InputTokenSelectProps<T>) => {
  const { open: openModal } = useModal()

  const handleOpenModal = () => {
    openModal(ModalTokenSelect, { tokensList, onChangeToken })
  }

  return (
    <div className={classNames(styles.inputTokenSelect, className)}>
      <div className={styles.inputTokenSelectHeader}>
        <span className={styles.inputTokenSelectLabel}>{label}</span>
        {showControls && (
          <ControlsButtons
            maxValue={maxValue}
            onChange={onChange}
            decimals={selectedToken?.collateral.decimals}
          />
        )}
      </div>
      <div className={styles.inputTokenSelectWrapper}>
        <NumericInput
          value={value}
          onChange={onChange}
          className={styles.numericInput}
          disabled={disabled}
          placeholder="0"
        />
        <SelectTokenButton onClick={handleOpenModal} token={selectedToken} />
      </div>
    </div>
  )
}

export default InputTokenSelect

interface ControlsButtonsProps {
  onChange: (value: string) => void
  maxValue?: number
  decimals: number | undefined
}

const ControlsButtons: FC<ControlsButtonsProps> = ({ onChange, maxValue = 0, decimals }) => {
  const maxValueStr = decimals ? String(maxValue / Math.pow(10, decimals)) : String(maxValue)

  const onMaxClick = () => {
    onChange(limitDecimalPlaces(maxValueStr))
  }

  const onHalfClick = () => {
    const nextValue = bnToHuman(stringToBN(maxValueStr).div(new BN(2)))
    onChange(limitDecimalPlaces(nextValue.toString()))
  }

  return (
    <div className={styles.inputControlsButtons}>
      <div className={styles.inputMaxTokenBalance}>
        <Wallet /> {formatNumber(parseFloat(maxValueStr))}
      </div>

      <Button
        onClick={onHalfClick}
        className={styles.inputControlButton}
        variant="tertiary"
        size="small"
      >
        Half
      </Button>
      <Button
        onClick={onMaxClick}
        className={styles.inputControlButton}
        variant="tertiary"
        size="small"
      >
        Max
      </Button>
    </div>
  )
}

interface SelectTokenButtonProps<T extends BaseToken> {
  token: T | undefined
  onClick: () => void
}

const SelectTokenButton = <T extends BaseToken>({ token, onClick }: SelectTokenButtonProps<T>) => {
  if (!token) {
    return <Skeleton.Button className={styles.selectTokenButton} style={{ width: 100 }} />
  }

  return (
    <Button variant="tertiary" onClick={onClick} className={styles.selectTokenButton}>
      <img src={token.collateral.logoUrl} className={styles.selectTokenButtonIcon} />
      {token.collateral.ticker}
      <ChevronDown className={styles.selectTokenButtonChevronIcon} />
    </Button>
  )
}

const formatNumber = (value = 0) => {
  if (!value) return '0'

  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}
