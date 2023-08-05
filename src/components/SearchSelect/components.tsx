import { SearchOutlined } from '@ant-design/icons'

import styles from './SearchSelect.module.less'

export const PrefixInput = () => (
  <div className={styles.prefix}>
    <SearchOutlined />
  </div>
)

export const SelectLabels = ({ labels = [] }: { labels?: string[] }) => (
  <div className={styles.labels}>
    {labels.map((label) => (
      <span key={label}>{label}</span>
    ))}
  </div>
)
