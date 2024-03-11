import { CSSProperties, FC, useMemo } from 'react'

import { ExclamationCircleOutlined } from '@ant-design/icons'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'

import { AdventuresInfo } from '@banx/api/adventures'
import { BanxTokenStake } from '@banx/api/banxTokenStake'
import { Gamepad, MoneyBill } from '@banx/icons'
import { useModal } from '@banx/store'

import { AdventuresModal } from '../AdventuresModal'

import styles from './Sidebar.module.less'

interface SidebarProps {
  className?: string
  adventuresInfo: AdventuresInfo
  banxTokenStake: BanxTokenStake
}

export const Sidebar: FC<SidebarProps> = ({ adventuresInfo, className, banxTokenStake }) => {
  const { open } = useModal()

  return (
    <div className={classNames(styles.sidebar, className)}>
      <div className={styles.section}>
        <Title text="My squad" icon={<Gamepad />} />

        <div className={styles.stats}>
          <Info value={`${banxTokenStake.banxNftsStakedQuantity}/8,200`} text="NFTs staked" />
          <Button
            onClick={() => open(AdventuresModal, { adventuresInfo })}
            className={styles.manageButton}
            size="default"
            variant={'secondary'}
          >
            Manage
          </Button>
        </div>

        <div className={styles.stats}>
          <Info value={`${banxTokenStake.tokensStaked}/25B`} text="tokens staked" />
          <Button
            onClick={() => open(AdventuresModal, { adventuresInfo })}
            className={styles.manageButton}
            size="default"
            variant={'secondary'}
          >
            Manage
          </Button>
        </div>

        <div className={styles.divider}>
          <span>total staked</span>
          <span>10,000 pts</span>
        </div>
      </div>

      <div className={styles.section}>
        <Title text="Rewards" icon={<MoneyBill />} />

        <div className={styles.stats}>
          <Info value={'1.5'} text="claimable" />
          <Button className={styles.manageButton} size="default">
            Claim
          </Button>
        </div>

        <div className={styles.divider}>
          <span>total claimed</span>
          <span>10,000 pts</span>
        </div>
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
}

const Info: FC<InfoProps> = ({ value, text, textStyle }) => (
  <div className={styles.infoWrapper}>
    <div className={styles.info}>
      <span>{value}</span>
      <span style={textStyle}>{text}</span>
    </div>
  </div>
)
