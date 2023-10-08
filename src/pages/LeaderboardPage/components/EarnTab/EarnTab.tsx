import { FC } from 'react'

import { NavLink } from 'react-router-dom'

import { Button } from '@banx/components/Buttons'
import EmptyList from '@banx/components/EmptyList'

import { Borrow, CircleCheck, Lend } from '@banx/icons'
import { PATHS } from '@banx/router'

import styles from './EarnTab.module.less'

const EarnTab = () => {
  return (
    <>
      <EmptyList message="No exact formula is specified, but here are some tips:" />
      <div className={styles.earnTabContent}>
        <ContentBlock
          title="Lend"
          InfoBlock={<InfoBlock infoTexts={LEND_INFO_TEXTS} path={PATHS.LEND} />}
        />
        <ContentBlock
          title="Borrow"
          InfoBlock={<InfoBlock infoTexts={BORROW_INFO_TEXTS} path={PATHS.BORROW} />}
        />
      </div>
    </>
  )
}

export default EarnTab

interface ContentBlockProps {
  title: 'Lend' | 'Borrow'
  InfoBlock: JSX.Element
}
const ContentBlock: FC<ContentBlockProps> = ({ title, InfoBlock }) => {
  return (
    <div className={styles.contentBlockContainer}>
      <div className={styles.titleBlockWrapper}>
        {title === 'Lend' && <Lend className={styles.titleBlockIcon} />}
        {title === 'Borrow' && <Borrow className={styles.titleBlockIcon} />}
        <span className={styles.titleBlock}>{title}</span>
      </div>

      {InfoBlock}
    </div>
  )
}

interface InfoBlockProps {
  infoTexts: string[]
  path: string
}
const InfoBlock: FC<InfoBlockProps> = ({ infoTexts, path }) => {
  const actionText = path === PATHS.LEND ? 'Start lending' : 'Start borrowing'

  return (
    <div className={styles.infoBlock}>
      {infoTexts.map((text, index) => (
        <div className={styles.infoRow} key={index}>
          <CircleCheck />
          {text}
        </div>
      ))}
      <NavLink className={styles.actionButton} to={path}>
        <Button>{actionText}</Button>
      </NavLink>
    </div>
  )
}

const LEND_INFO_TEXTS = [
  'Only lending on Banx.gg counts',
  'The more you lend, the more you earn',
  'Time matters: longer a loans is a active — more points',
  'Loyalty matters: higher loyalty — more points',
]

const BORROW_INFO_TEXTS = [
  'Only borrowing on Banx.gg counts',
  'The more you borrow, the more you earn',
  'Time matters: longer a loans is a active — more points',
  'Loyalty matters: higher loyalty — more points',
]
