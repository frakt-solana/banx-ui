import { FC } from 'react'

import { ExclamationCircleOutlined } from '@ant-design/icons'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { web3 } from 'fbonds-core'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { BanxSubscribeAdventureOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { BanxAdventureSubscriptionState } from 'fbonds-core/lib/fbond-protocol/types'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { StatInfo, StatsInfoProps, VALUES_TYPES } from '@banx/components/StatInfo'

import { AdventuresInfo } from '@banx/api/adventures'
import { BanxTokenStake } from '@banx/api/banxTokenStake'
import { BANX_TOKEN_STAKE_DECIMAL } from '@banx/constants/banxNfts'
import { BanxToken, Gamepad, MoneyBill } from '@banx/icons'
import { StakeNftsModal, StakeTokens } from '@banx/pages/AdventuresPage/components'
import { calcPartnerPoints } from '@banx/pages/AdventuresPage/helpers'
import { useBanxTokenBalance } from '@banx/pages/AdventuresPage/hooks/useBanxTokenBalance'
import { useBanxStakeState } from '@banx/pages/AdventuresPage/state'
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
import { calculatePlayerPointsForTokens } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'

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
  const wallet = useWallet()
  const { banxStake, banxTokenSettings, updateStake } = useBanxStakeState()

  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const tokensPts = fromDecimals(
    calcPartnerPoints(banxTokenStake.tokensStaked, tokensPerPartnerPoints),
    BANX_TOKEN_STAKE_DECIMAL,
  )
  const { data: balance, isLoading } = useBanxTokenBalance(connection, publicKey)
  const totalPts = parseFloat(tokensPts.toString()) + banxTokenStake.partnerPointsStaked
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
      weeks,
    }

    new TxnExecutor(stakeBanxClaimAction, { wallet, connection })
      .addTxnParam(params)
      .on('pfSuccessEach', (results) => {
        const { txnHash } = results[0]
        enqueueSnackbar({
          message: 'Successfully claimed',
          type: 'success',
          solanaExplorerPath: `tx/${txnHash}`,
        })
        results.forEach(({ result }) => !!result && updateStake(result))
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
    if (!banxTokenSettings?.maxTokenStakeAmount || isLoading) {
      return '0'
    }

    return formatCompact(
      fromDecimals(banxTokenStake.tokensStaked + parseFloat(balance), BANX_TOKEN_STAKE_DECIMAL),
    )
  }

  const stakenTokensPlayersPoints = calculatePlayerPointsForTokens(banxTokenStake.tokensStaked)
  const totalPlayersPoints = format((banxTokenStake.playerPointsStaked + stakenTokensPlayersPoints).toFixed(2))

  const Totals = () => {
    return (
      <div>
        <div className={styles.totalValues}>{format(totalPts)} partner</div>
        <div className={styles.totalValues}>{totalPlayersPoints} player</div>
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
              value={format(fromDecimals(rewards, BANX_TOKEN_STAKE_DECIMAL))}
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
