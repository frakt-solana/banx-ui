import { FC } from 'react'

import { Skeleton } from 'antd'
import classNames from 'classnames'
import { BN } from 'fbonds-core'

import { Button } from '@banx/components/Buttons'
import { NumericStepInput } from '@banx/components/inputs'

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
  const { open: openModal } = useModal()

  const handleOpenModal = () => {
    openModal(ModalTokenSelect, { selectedToken, tokenList, onChangeToken })
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
          value={value}
          onChange={onChange}
          placeholder="0"
          className={styles.numericStepInput}
          disabled={disabledInput}
        />

        <SelectTokenButton onClick={handleOpenModal} selectedToken={selectedToken} />
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

      <Button
        onClick={onHalfClick}
        className={styles.inputTokenSelectControlButton}
        variant="tertiary"
        size="small"
      >
        Half
      </Button>
      <Button
        onClick={onMaxClick}
        className={styles.inputTokenSelectControlButton}
        variant="tertiary"
        size="small"
      >
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
  showRightLabel?: boolean
}
export const SkeletonInputTokenSelect: FC<SkeletonInputTokenSelectProps> = ({
  label,
  className,
  showRightLabel = false,
}) => {
  return (
    <div className={classNames(styles.inputTokenSelectWrapper, className)}>
      <div className={styles.inputTokenSelectHeader}>
        <div className={styles.inputTokenSelectLabel}>{label}</div>
        {showRightLabel && <Skeleton.Input size="small" />}
      </div>
      <div className={styles.inputTokenSelect}>
        <Skeleton.Input className={styles.skeletonInputTokenSelect} />
      </div>
    </div>
  )
}
