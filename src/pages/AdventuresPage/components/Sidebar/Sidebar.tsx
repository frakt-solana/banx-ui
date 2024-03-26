import { FC } from 'react'

import { ExclamationCircleOutlined } from '@ant-design/icons'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { BN, web3 } from 'fbonds-core'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { BanxSubscribeAdventureOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { calculatePlayerPointsForTokens } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { BanxAdventureSubscriptionState } from 'fbonds-core/lib/fbond-protocol/types'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { StatInfo, StatsInfoProps, VALUES_TYPES } from '@banx/components/StatInfo'

import { BanxTokenStake } from '@banx/api/banxTokenStake'
import { BANX_TOKEN_STAKE_DECIMAL } from '@banx/constants/banxNfts'
import { BanxToken, Gamepad, MoneyBill } from '@banx/icons'
import { useBanxTokenSettings, useBanxTokenStake } from '@banx/pages/AdventuresPage'
import { StakeNftsModal, StakeTokens } from '@banx/pages/AdventuresPage/components'
import { calcPartnerPoints } from '@banx/pages/AdventuresPage/helpers'
import { useModal } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { stakeBanxClaimAction } from '@banx/transactions/banxStaking/stakeBanxClaimAction'
import {
  enqueueSnackbar,
  formatNumbersWithCommas as format,
  formatCompact,
  fromDecimals,
  usePriorityFees,
} from '@banx/utils'

import styles from './Sidebar.module.less'

interface SidebarProps {
  className?: string
  banxTokenStake: BanxTokenStake
  nftsCount: string
  totalClaimed: string
  rewards: bigint
  tokensPerPartnerPoints: string
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
  const wallet = useWallet()
  const { banxTokenSettings } = useBanxTokenSettings()
  const { banxStake } = useBanxTokenStake()

  const { connection } = useConnection()
  const tokensPts = fromDecimals(
    calcPartnerPoints(banxTokenStake.tokensStaked, tokensPerPartnerPoints),
    BANX_TOKEN_STAKE_DECIMAL,
  )

  const banxWalletBalance = banxStake?.banxWalletBalance || '0'

  const totalPts = (
    parseFloat(tokensPts.toString()) + parseFloat(banxTokenStake.partnerPointsStaked)
  ).toFixed(2)
  const priorityFees = usePriorityFees()

  const claimAction = () => {
    if (!wallet.publicKey?.toBase58() || !banxTokenSettings || !banxStake?.banxTokenStake) {
      return
    }
    const banxSubscribeAdventureOptimistic: BanxSubscribeAdventureOptimistic = {
      banxStakingSettings: banxTokenSettings,
      banxAdventures: banxStake.banxAdventures,
      banxTokenStake: banxStake.banxTokenStake,
    }

    const weeks = banxStake.banxAdventures
      .filter(
        ({ adventureSubscription }) =>
          adventureSubscription?.adventureSubscriptionState ===
          BanxAdventureSubscriptionState.Active,
      )
      .map(({ adventure }) => adventure.week)

    const params = {
      tokenMint: new web3.PublicKey(BANX_TOKEN_MINT),
      optimistic: banxSubscribeAdventureOptimistic,
      priorityFees,
      weeks: weeks.map((w) => parseFloat(w)),
    }

    new TxnExecutor(stakeBanxClaimAction, { wallet, connection })
      .addTxnParam(params)
      .on('pfSuccessEach', (results) => {
        const { txnHash } = results[0]
        enqueueSnackbar({
          message: 'Transaction sent',
          type: 'info',
          solanaExplorerPath: `tx/${txnHash}`,
        })
      })
      .on('pfSuccessAll', () => {
        close()
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: params,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Claim StakeBanx',
        })
      })
      .execute()
  }

  const tokensTotal = () => {
    if (!banxTokenSettings?.maxTokenStakeAmount) {
      return '0'
    }
    const tokensStakedBN = new BN(banxTokenStake.tokensStaked)
    const balanceBN = new BN(banxWalletBalance)

    return formatCompact(fromDecimals(tokensStakedBN.add(balanceBN), BANX_TOKEN_STAKE_DECIMAL))
  }

  const stakenTokensPlayersPoints = calculatePlayerPointsForTokens(
    parseFloat(banxTokenStake.tokensStaked),
  )
  const totalPlayersPoints = format(
    (parseFloat(banxTokenStake.playerPointsStaked) + stakenTokensPlayersPoints).toString(),
  )

  const Totals = () => {
    return (
      <div>
        <div className={styles.totalValues}>{format(totalPts)} partner</div>
        <div className={styles.totalValues}>{parseFloat(totalPlayersPoints)} player</div>
      </div>
    )
  }

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
                )}/${tokensTotal()}`}
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

          <StakingStat
            classNamesProps={{
              label: styles.totalPointsStaked,
              labelWrapper: styles.labelWrapper,
            }}
            tooltipText="The Banx ecosystem is governed by Partner and Player points. These points determine holder benefits, proportional to total amount of points staked."
            label="Total points staked"
            value={<Totals />}
            flexType="row"
          />
        </div>

        <div className={styles.claimSection}>
          <Title text="Rewards" icon={<MoneyBill />} />

          <div className={styles.claimStatsContainer}>
            <StakingStat
              label="claimable"
              value={format(fromDecimals(rewards.toString(), BANX_TOKEN_STAKE_DECIMAL))}
              icon={BanxToken}
            />
            <Button onClick={claimAction} disabled={!rewards} className={styles.manageButton}>
              Claim
            </Button>
          </div>

          <div className={styles.divider} />

          <StakingStat
            label="Total claimed"
            value={format(fromDecimals(totalClaimed, BANX_TOKEN_STAKE_DECIMAL))}
            icon={BanxToken}
            flexType="row"
          />
        </div>
      </div>

      <div className={styles.infoSection}>
        <p>
          <ExclamationCircleOutlined />
          As your Banx NFTs stay in your wallet when used as collateral for a loan on Banx.gg they
          can be sent in Adventures in parallel
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
    labelWrapper: classNamesProps?.labelWrapper,
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
