import {CSSProperties, FC} from 'react'

import {ExclamationCircleOutlined} from '@ant-design/icons'
import classNames from 'classnames'

import {Button} from '@banx/components/Buttons'

import {BanxTokenStake} from '@banx/api/banxTokenStake'
import {Gamepad, MoneyBill} from '@banx/icons'
import styles from './Sidebar.module.less'
import {formatCompact, formatNumbersWithCommas} from "@banx/utils";
import {TOTAL_BANX_NFTS} from "@banx/constants";
import {useModal} from "@banx/store";
import {StakeTokens} from "@banx/pages/AdventuresPage/components/StakeTokens";
import {AdventuresModal} from "@banx/pages/AdventuresPage/components/AdventuresModal";

interface SidebarProps {
  className?: string
  banxTokenStake: BanxTokenStake
  maxTokenStakeAmount: number
  totalStaked: number
  totalClaimed: number
}

export const Sidebar: FC<SidebarProps> = ({
                                            className,
                                            banxTokenStake,
                                            maxTokenStakeAmount,
                                            totalStaked,
                                            totalClaimed
                                          }) => {
  const format = formatNumbersWithCommas
  const {open} = useModal()

  return (
    <div className={classNames(styles.sidebar, className)}>
      <div className={styles.section}>
        <Title text="My squad" icon={<Gamepad/>}/>

        <div className={styles.stats}>
          <Info value={`${format(banxTokenStake.banxNftsStakedQuantity)}/${format(TOTAL_BANX_NFTS)}`}
                text="NFTs staked"/>
          <Button
            onClick={() => open(AdventuresModal)}
            className={styles.manageButton}
            size="default"
            variant={'secondary'}
          >
            Manage
          </Button>
        </div>

        <div className={styles.stats}>
          <Info value={`${formatCompact(banxTokenStake.tokensStaked)}/${formatCompact(maxTokenStakeAmount)}`}
                text="tokens staked"/>
          <Button
            onClick={() => open(StakeTokens)}
            className={styles.manageButton}
            size="default"
            variant={'secondary'}
          >
            Manage
          </Button>
        </div>

        <div className={styles.divider}>
          <span>total staked</span>
          <span>{format(totalStaked)}pts</span>
        </div>
      </div>

      <div className={styles.section}>
        <Title text="Rewards" icon={<MoneyBill/>}/>

        <div className={styles.stats}>
          <Info value={format(banxTokenStake.farmedAmount)} text="claimable"/>
          <Button className={styles.manageButton} size="default">
            Claim
          </Button>
        </div>

        <div className={styles.divider}>
          <span>total claimed</span>
          <span> {format(totalClaimed)} pts</span>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.warns}>
          <p>
            <ExclamationCircleOutlined/>
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

const Title: FC<TitleProps> = ({text, icon}) => (
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

const Info: FC<InfoProps> = ({value, text, textStyle}) => (
  <div className={styles.infoWrapper}>
    <div className={styles.info}>
      <span>{value}</span>
      <span style={textStyle}>{text}</span>
    </div>
  </div>
)
