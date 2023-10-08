import { CSSProperties, FC, useMemo } from 'react'

import { ExclamationCircleOutlined } from '@ant-design/icons'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'

import { AdventuresInfo } from '@banx/api/adventures'
import { Gamepad } from '@banx/icons'
import { useModal } from '@banx/store'

import { calcNftsPartnerPoints, isNftStaked } from '../../helpers'
import { AdventuresModal } from '../AdventuresModal'

import styles from './Sidebar.module.less'

interface SidebarProps {
  className?: string
  adventuresInfo: AdventuresInfo
}

export const Sidebar: FC<SidebarProps> = ({ adventuresInfo, className }) => {
  const { nfts } = adventuresInfo
  const { open } = useModal()

  const stakedNfts = useMemo(() => {
    return (nfts || [])?.filter(isNftStaked)
  }, [nfts])

  const partnerPoints = useMemo(() => calcNftsPartnerPoints(stakedNfts), [stakedNfts])

  return (
    <div className={classNames(styles.sidebar, className)}>
      <div className={styles.section}>
        <Title text="My squad" icon={<Gamepad />} />

        <Info
          value={`${stakedNfts.length}/${nfts?.length}`}
          text="Banx staked"
          button={{
            text: 'Manage',
            type: 'primary',
            onClick: () => open(AdventuresModal, { adventuresInfo }),
          }}
        />

        <Info value={partnerPoints.toString()} text="partner points" />
      </div>

      <div className={styles.section}>
        <div className={styles.warns}>
          <p>
            <ExclamationCircleOutlined />
            As your Banx stay in your wallet when used as collateral for a loan on Banx they can be
            sent in Adventures in parallel
          </p>
        </div>
      </div>
    </div>
  )
}

interface TitleProps {
  text: string
  icon?: JSX.Element
}

const Title: FC<TitleProps> = ({ text, icon }) => (
  <h2 className={styles.title}>
    <div className={styles.titleIcon}>{icon}</div>
    <span>{text}</span>
  </h2>
)

interface InfoProps {
  value: string
  text: string
  textStyle?: CSSProperties
  button?: {
    text: string
    onClick: () => void
    type?: 'primary' | 'secondary'
  }
}

const Info: FC<InfoProps> = ({ value, text, button, textStyle }) => (
  <div className={styles.infoWrapper}>
    <div className={styles.info}>
      <span>{value}</span>
      <span style={textStyle}>{text}</span>
    </div>
    {!!button && (
      <Button variant={button?.type || 'secondary'} onClick={button.onClick}>
        {button.text}
      </Button>
    )}
  </div>
)
