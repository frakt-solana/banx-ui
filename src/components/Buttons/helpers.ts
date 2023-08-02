import styles from './Buttons.module.less'

export const getSizeClassName = (size: 'small' | 'medium' | 'large') => {
  const sizeClassNames = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  }

  return sizeClassNames[size] || styles.medium
}
