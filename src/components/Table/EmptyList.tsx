import { FC } from 'react'

import styles from './Table.module.less'

interface EmptyListProps {
  message: string
}

const EmptyList: FC<EmptyListProps> = ({ message }) => {
  return <div className={styles.emptyList}>{message}</div>
}

export default EmptyList
