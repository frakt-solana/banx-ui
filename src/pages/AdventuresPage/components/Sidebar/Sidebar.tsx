import { FC } from 'react'

import { ExclamationCircleOutlined } from '@ant-design/icons'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { StatInfo, StatsInfoProps, VALUES_TYPES } from '@banx/components/StatInfo'

import { AdventuresInfo } from '@banx/api/adventures'
import { BanxTokenStake } from '@banx/api/banxTokenStake'
import { BANX_TOKEN_STAKE_DECIMAL } from '@banx/constants/banxNfts'
import { BanxLogo, Gamepad, MoneyBill } from '@banx/icons'
import { StakeNftsModal, StakeTokens } from '@banx/pages/AdventuresPage/components'
import { calcPartnerPoints } from '@banx/pages/AdventuresPage/helpers'
import { useBanxTokenBalance } from '@banx/pages/AdventuresPage/hooks/useBanxTokenBalance'
import { useModal } from '@banx/store'
import { formatNumbersWithCommas as format, formatCompact, fromDecimals } from '@banx/utils'

import styles from './Sidebar.module.less'

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
  tokensPerPartnerPoints,
}) => {
  const { open } = useModal()
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const tokensPts = fromDecimals(
    calcPartnerPoints(banxTokenStake.tokensStaked, tokensPerPartnerPoints),
    BANX_TOKEN_STAKE_DECIMAL,
  )
  const { data: balance } = useBanxTokenBalance(connection, publicKey)
  const totalPts = parseFloat(tokensPts.toString()) + banxTokenStake.partnerPointsStaked

  return (
    <div className={classNames(styles.sidebar, className)}>
      <div className={styles.content}>
        <div className={styles.squadSection}>
          <Title text="My squad" icon={<Gamepad />} />

          <div className={styles.stakedInfoContainer}>
            <div className={styles.stakedInfo}>
              <StakingStat
                label="NFTs staked"
                value={`${format(banxTokenStake.banxNftsStakedQuantity)}/${format(nftsCount)}`}
              />

              <Button
                onClick={() => open(StakeNftsModal)}
                className={styles.manageButton}
                variant="secondary"
              >
                Manage
              </Button>
            </div>

            <div className={styles.stakedInfo}>
              <StakingStat
                label="Tokens staked"
                value={`${formatCompact(
                  fromDecimals(banxTokenStake.tokensStaked, BANX_TOKEN_STAKE_DECIMAL),
                )}/${formatCompact(fromDecimals(balance, BANX_TOKEN_STAKE_DECIMAL))}`}
              />

              <Button
                onClick={() => open(StakeTokens)}
                className={styles.manageButton}
                variant="secondary"
              >
                Manage
              </Button>
            </div>
          </div>

          <div className={styles.divider} />

          <StakingStat label="Total staked" value={`${format(totalPts)} pts`} flexType="row" />
        </div>

        <div className={styles.claimSection}>
          <Title text="Rewards" icon={<MoneyBill />} />

          <div className={styles.claimStatsContainer}>
            <StakingStat
              label="claimable"
              value={format(fromDecimals(rewards, BANX_TOKEN_STAKE_DECIMAL))}
              icon={BanxLogo}
            />
            <Button className={styles.manageButton}>Claim</Button>
          </div>

          <div className={styles.divider} />

          <StakingStat
            label="Total claimed"
            value={format(fromDecimals(totalClaimed, BANX_TOKEN_STAKE_DECIMAL))}
            icon={BanxLogo}
            flexType="row"
          />
        </div>
      </div>

      <div className={styles.infoSection}>
        <p>
          <ExclamationCircleOutlined />
          As your Banx stay in your wallet when used as collateral for a loan on Banx they can be
          sent in Adventures in parallel
        </p>
      </div>
    </div>
  )
}

interface TitleProps {
  text: string
  icon?: JSX.Element
}

const Title: FC<TitleProps> = ({ text, icon }) => (
  <h2 className={styles.titleWrapper}>
    <div className={styles.icon}>{icon}</div>
    <span>{text}</span>
  </h2>
)

const StakingStat: FC<StatsInfoProps> = ({
  value,
  label,
  flexType = 'column',
  classNamesProps,
  ...props
}) => {
  const stakingStatClassNames = {
    container: classNames(
      styles.stakingStatInfo,
      { [styles.col]: flexType === 'column' },
      classNamesProps?.container,
    ),
    value: classNames(styles.value, classNamesProps?.value),
    label: classNames(styles.label, classNamesProps?.label),
  }

  return (
    <StatInfo
      label={label}
      value={value}
      valueType={VALUES_TYPES.STRING}
      flexType={flexType}
      classNamesProps={stakingStatClassNames}
      {...props}
    />
  )
}
