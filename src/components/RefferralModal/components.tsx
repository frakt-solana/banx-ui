import { FC } from 'react'

import { Input, InputProps } from '@banx/components/inputs/Input'

import styles from './RefferralModal.module.less'

interface ReferralInputProps extends InputProps {
  label: string
  actionButton: ActionButtonProps
}

export const ReferralInput: FC<ReferralInputProps> = ({ label, actionButton, ...inputProps }) => (
  <div className={styles.referralInputField}>
    <span className={styles.referralInputLabel}>{label}</span>
    <div className={styles.referralInputWrapper}>
      <Input className={styles.referralInput} {...inputProps} />
      <InputActionButton actionButton={actionButton} />
    </div>
  </div>
)

type ActionButtonProps = {
  text: string
  icon: FC
  onClick: () => void
}

const InputActionButton: FC<{ actionButton: ActionButtonProps }> = ({ actionButton }) => {
  const { text, icon: Icon, onClick } = actionButton

  return (
    <button onClick={onClick} className={styles.referralInputButton}>
      <Icon />
      <span>{text}</span>
    </button>
  )
}
