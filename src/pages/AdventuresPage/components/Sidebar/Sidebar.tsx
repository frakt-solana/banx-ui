import { CSSProperties, FC, useMemo } from 'react'

import { ExclamationCircleOutlined } from '@ant-design/icons'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { AdventuresInfo } from '@banx/api/adventures'
import { Gamepad } from '@banx/icons'
import { useModal } from '@banx/store'
import { formatNumbersWithCommas } from '@banx/utils'

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

        <div className={styles.stats}>
          <Info value={`${stakedNfts.length}/${nfts?.length}`} text="Banx staked" />

          <StatInfo
            label="partner points"
            value={formatNumbersWithCommas(partnerPoints)}
            valueType={VALUES_TYPES.STRING}
            flexType="row"
          />
        </div>
        <Button
          onClick={() => open(AdventuresModal, { adventuresInfo })}
          className={styles.manageButton}
          size="small"
        >
          Manage
        </Button>
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
