import { useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BanxSubscribeAdventureOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { Tab, Tabs, useTabs } from '@banx/components/Tabs'
import NumericInput from '@banx/components/inputs/NumericInput'
import { Modal } from '@banx/components/modals/BaseModal'

import { BANX_TOKEN_STAKE_DECIMAL } from '@banx/constants/banxNfts'
import { BanxLogo } from '@banx/icons'
import { calcPartnerPoints } from '@banx/pages/AdventuresPage/helpers'
import { useBanxStakeState } from '@banx/pages/AdventuresPage/state'
import { useModal } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { stakeBanxTokenAction, unstakeBanxTokenAction } from '@banx/transactions/banxStaking'
import {
  enqueueSnackbar,
  formatNumbersWithCommas as format,
  formatCompact,
  fromDecimals,
  toDecimals,
  usePriorityFees,
} from '@banx/utils'

import styles from './styles.module.less'

export const StakeTokens = () => {
  const { connection } = useConnection()
  const priorityFees = usePriorityFees()
  const { updateStake, banxStake, banxTokenSettings, balance } = useBanxStakeState()
  const wallet = useWallet()
  const { close } = useModal()
  const [value, setValue] = useState('')

  const { value: currentTabValue, ...tabProps } = useTabs({
    tabs: MODAL_TABS,
    defaultValue: MODAL_TABS[0].value,
  })

  const calcPts = (v: string | number) =>
    calcPartnerPoints(v, banxTokenSettings?.tokensPerPartnerPoints)
  const pointsToReceive = calcPts(value)

  const onStakeTokens = () => {
    if (!wallet.publicKey || !banxTokenSettings || !value || !banxStake?.banxTokenStake) {
      return
    }
    const optimistic: BanxSubscribeAdventureOptimistic = {
      banxStakingSettings: banxTokenSettings,
      banxAdventures: banxStake.banxAdventures,
      banxTokenStake: banxStake.banxTokenStake,
    }

    const txnParam = {
      tokensToStake: toDecimals(value, BANX_TOKEN_STAKE_DECIMAL),
      userPubkey: wallet.publicKey,
      optimistic,
      priorityFees,
    }

    new TxnExecutor(stakeBanxTokenAction, { wallet, connection })
      .addTxnParam(txnParam)
      .on('pfSuccessEach', (results) => {
        results.forEach(({ result }) => {
          const { banxStakingSettings, banxAdventures, banxTokenStake } = result || {}

          if (!banxStakingSettings || !banxAdventures || !banxTokenStake) {
            return
          }
          updateStake({
            banxTokenSettings: banxStakingSettings,
            banxStake: {
              ...banxStake,
              banxAdventures: banxAdventures,
              banxTokenStake: banxTokenStake,
            },
            balance: balance - toDecimals(value, BANX_TOKEN_STAKE_DECIMAL),
          })
        })
      })
      .on('pfSuccessAll', () => {
        enqueueSnackbar({
          message: 'Interest successfully claimed',
          type: 'success',
        })
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: txnParam,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Stake banx token',
        })
      })
      .execute()
  }
  const onUnstakeTokens = () => {
    if (!wallet.publicKey || !banxTokenSettings || !value || !banxStake?.banxTokenStake) {
      return
    }
    const optimistic: BanxSubscribeAdventureOptimistic = {
      banxStakingSettings: banxTokenSettings,
      banxAdventures: banxStake.banxAdventures,
      banxTokenStake: banxStake.banxTokenStake,
    }

    const txnParam = {
      tokensToUnstake: toDecimals(value, BANX_TOKEN_STAKE_DECIMAL),
      userPubkey: wallet.publicKey,
      optimistic,
      priorityFees,
    }

    new TxnExecutor(unstakeBanxTokenAction, { wallet, connection })
      .addTxnParam(txnParam)
      .on('pfSuccessEach', (results) => {
        results.forEach(({ result }) => {
          const { banxStakingSettings, banxAdventures, banxTokenStake } = result || {}

          if (!banxStakingSettings || !banxAdventures || !banxTokenStake) {
            return
          }

          updateStake({
            banxTokenSettings: result?.banxStakingSettings,
            banxStake: {
              ...banxStake,
              banxAdventures: banxAdventures,
              banxTokenStake: banxTokenStake,
            },
            balance: balance + parseFloat(toDecimals(value, BANX_TOKEN_STAKE_DECIMAL)),
          })
        })
      })
      .on('pfSuccessAll', () => {
        enqueueSnackbar({
          message: 'Interest successfully claimed',
          type: 'success',
        })
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: txnParam,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Stake banx token',
        })
      })
      .execute()
  }

  const onSubmit = () => {
    if (currentTabValue === ModalTabs.STAKE) {
      void onStakeTokens()
    }

    void onUnstakeTokens()
  }

  const idleOnWallet = fromDecimals(balance, BANX_TOKEN_STAKE_DECIMAL) - parseFloat(value)
  const banxBalance = formatCompact(balance)
  const tokensStaked = format(
    fromDecimals(banxTokenSettings?.tokensStaked || 0, BANX_TOKEN_STAKE_DECIMAL),
  )
  const ptsAmount = format(
    calcPts(fromDecimals(banxTokenSettings?.tokensStaked || 0, BANX_TOKEN_STAKE_DECIMAL)),
  )

  const disabledBtn = useMemo(() => {
    const emptyValue = !parseFloat(value)
    const notEnoughStake =
      currentTabValue === ModalTabs.STAKE &&
      parseFloat(fromDecimals(balance, BANX_TOKEN_STAKE_DECIMAL)) < parseFloat(value)
    const notEnoughUnStake =
      currentTabValue === ModalTabs.UNSTAKE &&
      parseFloat(fromDecimals(banxTokenSettings?.tokensStaked || 0, BANX_TOKEN_STAKE_DECIMAL)) <
        parseFloat(value)

    return emptyValue || notEnoughStake || notEnoughUnStake
  }, [value, balance, currentTabValue, banxTokenSettings?.tokensStaked])

  return (
    <Modal className={styles.modal} open onCancel={close} footer={false} width={572} centered>
      <Tabs value={currentTabValue} {...tabProps} />
      <div className={styles.container}>
        {currentTabValue === ModalTabs.STAKE && (
          <div className={styles.row}>
            <span className={styles.uppercaseText}>wallet balance</span>
            <span className={styles.valueText}>{banxBalance}</span>
            <BanxLogo />
          </div>
        )}

        {currentTabValue === ModalTabs.UNSTAKE && (
          <div className={styles.row}>
            <span className={styles.uppercaseText}>total staked</span>
            <span className={styles.valueText}>{tokensStaked}</span>
            <BanxLogo />
            <span className={styles.valueText}>{ptsAmount} pts</span>
          </div>
        )}

        <div className={styles.input}>
          <NumericInput positiveOnly onChange={setValue} value={value} />
          <Button size="small" variant="secondary">
            Use max
          </Button>
        </div>

        {currentTabValue === ModalTabs.STAKE && (
          <>
            <div className={styles.rowBtw}>
              <span className={styles.uppercaseText}>idle on wallet</span>
              <div>
                <span className={styles.valueText}>{idleOnWallet}</span>
                <BanxLogo />
              </div>
            </div>

            <div className={styles.rowBtw}>
              <span className={styles.uppercaseText}>you will get</span>
              <div>
                <span className={styles.valueText}>{format(pointsToReceive || 0)} pts</span>
              </div>
            </div>
          </>
        )}

        {currentTabValue === ModalTabs.UNSTAKE && (
          <>
            <div className={styles.rowBtw}>
              <span className={styles.uppercaseText}>staked</span>
              <div>
                <span className={styles.valueText}>{tokensStaked}</span>
                <BanxLogo />
              </div>
            </div>

            <div className={styles.rowBtw}>
              <span className={styles.uppercaseText}>you will unstake</span>
              <div>
                <span className={styles.valueText}>{format(pointsToReceive || 0)} pts</span>
              </div>
            </div>
          </>
        )}

        <Button
          disabled={disabledBtn}
          size="default"
          variant="primary"
          className={styles.btn}
          onClick={onSubmit}
        >
          {currentTabValue === ModalTabs.STAKE && 'Stake'}
          {currentTabValue === ModalTabs.UNSTAKE && 'Unstake'}
        </Button>
      </div>
    </Modal>
  )
}

enum ModalTabs {
  STAKE = 'stake',
  UNSTAKE = 'unstake',
}

const MODAL_TABS: Tab[] = [
  {
    label: 'Stake',
    value: 'stake',
  },
  {
    label: 'Unstake',
    value: 'unstake',
  },
]
