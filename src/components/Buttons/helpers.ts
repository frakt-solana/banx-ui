import styles from './Buttons.module.less'

export const getSizeClassName = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return styles.small
    case 'large':
      return styles.large
    default:
      return styles.medium
  }
}
