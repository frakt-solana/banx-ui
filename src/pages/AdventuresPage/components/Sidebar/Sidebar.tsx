import React, { CSSProperties, FC } from 'react'

import { ExclamationCircleOutlined } from '@ant-design/icons'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { web3 } from 'fbonds-core'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { BanxSubscribeAdventureOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { BanxAdventureSubscriptionState } from 'fbonds-core/lib/fbond-protocol/types'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'

import { AdventuresInfo } from '@banx/api/adventures'
import { BanxTokenStake } from '@banx/api/banxTokenStake'
import { BANX_TOKEN_STAKE_DECIMAL } from '@banx/constants/banxNfts'
import { BanxLogo, Gamepad, MoneyBill } from '@banx/icons'
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
  const { data: balance } = useBanxTokenBalance(connection, publicKey)
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
          <Button
            disabled={!rewards}
            className={styles.manageButton}
            size="default"
            onClick={claimAction}
          >
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
