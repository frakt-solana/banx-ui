import { DetailedHTMLProps, FC, InputHTMLAttributes } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'

import styles from './SettingsScreen.module.less'

export enum RightAddonState {
  EMPTY,
  LOADING,
  SUBMIT,
  DELETE,
  DELETE_CONFIRM,
}

const AddonStateNames = {
  [RightAddonState.SUBMIT]: 'Submit',
  [RightAddonState.DELETE]: 'Delete',
  [RightAddonState.DELETE_CONFIRM]: 'Confirm',
}

interface RightAddonProps {
  state?: RightAddonState
  onClick?: () => void
}

interface AddressInputProps
  extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  wrapperClassName?: string
  rightAddonProps?: RightAddonProps
  isError?: boolean
}

export const AddressInput: FC<AddressInputProps> = ({
  wrapperClassName,
  rightAddonProps,
  isError = false,
  className,
  placeholder,
  type,
  value,
  ...props
}) => {
  const {
    state: rightAddonState = RightAddonState.EMPTY,
    onClick: onRightAddonClick = () => null,
  } = rightAddonProps || {}

  return (
    <div
      className={classNames(
        styles.addressInputWrapper,
        { [styles.addressInputWrapper__error]: isError },
        wrapperClassName,
      )}
    >
      <input
        className={classNames(styles.addressInput, className)}
        autoComplete="off"
        placeholder={placeholder}
        type={type}
        value={value}
        {...props}
      />
      {rightAddonState === RightAddonState.LOADING && <div className={styles.addressInputLoader} />}
      {rightAddonState !== RightAddonState.LOADING && rightAddonState !== RightAddonState.EMPTY && (
        <Button onClick={onRightAddonClick} size="small">
          {AddonStateNames[rightAddonState]}
        </Button>
      )}
    </div>
  )
}

interface GenerateRightAddonPropsParams {
  currentValue: string
  isLoading: boolean
  isEditing: boolean
  isDeleting: boolean
  isSaved: boolean
  onCreate: () => void
  onUpdate: () => void
  onDeleteStart: () => void
  onDeleteConfirm: () => void
}

export const generateRightAddonProps = ({
  currentValue,
  isLoading,
  isEditing,
  isDeleting,
  isSaved,
  onCreate,
  onUpdate,
  onDeleteStart,
  onDeleteConfirm,
}: GenerateRightAddonPropsParams) => {
  if (isLoading)
    return {
      state: RightAddonState.LOADING,
      onClick: () => null,
    }

  if (isEditing)
    return {
      state: RightAddonState.SUBMIT,
      onClick: onUpdate,
    }

  if (isSaved && !isEditing && !isDeleting)
    return {
      state: RightAddonState.DELETE,
      onClick: onDeleteStart,
    }

  if (isDeleting)
    return {
      state: RightAddonState.DELETE_CONFIRM,
      onClick: onDeleteConfirm,
    }

  if (currentValue)
    return {
      state: RightAddonState.SUBMIT,
      onClick: onCreate,
    }

  return {
    state: RightAddonState.EMPTY,
    onClick: () => null,
  }
}
