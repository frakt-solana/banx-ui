import React, { CSSProperties, FC } from 'react'

import { ExclamationCircleOutlined } from '@ant-design/icons'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'

import { AdventuresInfo } from '@banx/api/adventures'
import { BanxTokenStake } from '@banx/api/banxTokenStake'
import { BANX_TOKEN_STAKE_DECIMAL } from '@banx/constants/banxNfts'
import { BanxLogo, Gamepad, MoneyBill } from '@banx/icons'
import { StakeNftsModal, StakeTokens } from '@banx/pages/AdventuresPage/components'
import { useModal } from '@banx/store'
import { formatNumbersWithCommas as format, formatCompact, fromDecimals } from '@banx/utils'

import styles from './Sidebar.module.less'
import { calcPartnerPoints } from '@banx/pages/AdventuresPage/helpers'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useBanxTokenBalance } from '@banx/pages/AdventuresPage/hooks/useBanxTokenBalance'

interface SidebarProps {
  className?: string
  banxTokenStake: BanxTokenStake
  adventuresInfo: AdventuresInfo
  nftsCount: number
  totalClaimed: number
  rewards: number
  tokensPerPartnerPoints: number
}

export const Sidebar: FC<SidebarProps> = ({
  className,
  banxTokenStake,
  nftsCount,
  totalClaimed,
  rewards,
  tokensPerPartnerPoints
}) => {
  const { open } = useModal()
  const {publicKey} = useWallet()
  const {connection} = useConnection()
  const tokensPts = fromDecimals(calcPartnerPoints(banxTokenStake.tokensStaked, tokensPerPartnerPoints), BANX_TOKEN_STAKE_DECIMAL)
  const {data: balance} = useBanxTokenBalance(connection, publicKey)
  const totalPts = parseFloat(tokensPts.toString()) + banxTokenStake.partnerPointsStaked

  return (
    <div className={classNames(styles.sidebar, className)}>
      <div className={styles.section}>
        <Title text="My squad" icon={<Gamepad />} />

        <div className={styles.stats}>
          <Info
            value={`${format(banxTokenStake.banxNftsStakedQuantity)}/${format(nftsCount)}`}
            text="NFTs staked"
          />
          <Button
            onClick={() => open(StakeNftsModal)}
            className={styles.manageButton}
            size="default"
            variant={'secondary'}
          >
            Manage
          </Button>
        </div>

        <div className={styles.stats}>
          <Info
            value={`${formatCompact(
              fromDecimals(banxTokenStake.tokensStaked, BANX_TOKEN_STAKE_DECIMAL),
            )}/${formatCompact(fromDecimals(balance, BANX_TOKEN_STAKE_DECIMAL))}`}
            text="tokens staked"
          />
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
          <span>{format(totalPts)} pts</span>
        </div>
      </div>

      <div className={styles.section}>
        <Title text="Rewards" icon={<MoneyBill />} />

        <div className={styles.stats}>
          <ClaimInfo
            icon={<BanxLogo />}
            value={format(fromDecimals(rewards, BANX_TOKEN_STAKE_DECIMAL))}
            text="claimable"
          />
          <Button className={styles.manageButton} size="default">
            Claim
          </Button>
        </div>

        <div className={styles.divider}>
          <span>total claimed</span>
          <span>
            {' '}
            {format(fromDecimals(totalClaimed, BANX_TOKEN_STAKE_DECIMAL))} <BanxLogo />
          </span>
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

interface ClaimInfoProps {
  value: string
  text: string
  textStyle?: CSSProperties
  icon?: React.ReactElement
}

const ClaimInfo: FC<ClaimInfoProps> = ({ value, text, textStyle, icon }) => (
  <div className={styles.infoWrapper}>
    <div className={styles.claimInfo}>
      <span>
        {value} {icon}
      </span>
      <span style={textStyle}>{text}</span>
    </div>
  </div>
)
