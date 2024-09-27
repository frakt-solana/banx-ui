import { FC } from 'react'

import { SearchOutlined } from '@ant-design/icons'
import classNames from 'classnames'

import { ChevronDown, EmptyContent } from '@banx/icons'

import { Button } from '../Buttons'

import styles from './SearchSelect.module.less'

export const PrefixInput = () => (
  <div className={styles.prefix}>
    <SearchOutlined />
  </div>
)

interface SuffixIconProps {
  isPopupOpen: boolean
  disabled?: boolean
}
export const SuffixIcon: FC<SuffixIconProps> = ({ isPopupOpen, disabled = false }) => (
  <ChevronDown
    className={classNames(
      styles.suffixIcon,
      { [styles.rotate]: isPopupOpen },
      { [styles.disabled]: disabled },
    )}
  />
)

export const SelectLabels = ({ labels = [] }: { labels?: string[] }) => (
  <div className={styles.labels}>
    {labels.map((label) => (
      <span key={label}>{label}</span>
    ))}
  </div>
)

interface CollapsedContentProps {
  onClick: () => void
  selectedOptions: string[]
}
export const CollapsedContent: FC<CollapsedContentProps> = ({ onClick, selectedOptions }) => (
  <div className={styles.collapsedContent}>
    <Button type="circle" variant="secondary" onClick={onClick}>
      {!!selectedOptions?.length && <div className={styles.tip}>{selectedOptions.length}</div>}
      <SearchOutlined />
    </Button>
  </div>
)

export const NotFoundContent = () => (
  <div className={styles.notFoundContent}>
    <EmptyContent />
    <span>No matching results</span>
  </div>
)
