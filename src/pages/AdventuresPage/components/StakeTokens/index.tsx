import { FC, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BanxSubscribeAdventureOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { Tab, Tabs, useTabs } from '@banx/components/Tabs'
import NumericInput from '@banx/components/inputs/NumericInput'
import { Modal } from '@banx/components/modals/BaseModal'

import { BanxLogo } from '@banx/icons'
import { useBanxTokenSettings } from '@banx/pages/AdventuresPage/hooks/useBanxTokenSettings'
import { useBanxTokenStake } from '@banx/pages/AdventuresPage/hooks/useBanxTokenStake'
import { useModal } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { stakeBanxTokenAction } from '@banx/transactions/banxStaking'
import { enqueueSnackbar, formatNumbersWithCommas } from '@banx/utils'

import styles from './styled.module.less'

interface Props {}

export const StakeTokens: FC<Props> = () => {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { close } = useModal()
  const [value, setValue] = useState('')
  const { banxTokenSettings } = useBanxTokenSettings()
  const { banxStake } = useBanxTokenStake()
  const { value: currentTabValue, ...tabProps } = useTabs({
    tabs: MODAL_TABS,
    defaultValue: MODAL_TABS[0].value,
  })

  const format = formatNumbersWithCommas
  const calcPts = (v: string | number) =>
    banxTokenSettings?.tokensPerPartnerPoints
      ? Math.round((Number(v) * 1e8) / banxTokenSettings?.tokensPerPartnerPoints)
      : 0
  const willGetPts = calcPts(value)

  const onStakeTokens = () => {
    if (!wallet.publicKey || !banxStake?.banxAdventures?.length || !banxTokenSettings || !value) {
      return
    }
    const optimistic: BanxSubscribeAdventureOptimistic = {
      banxStakingSettings: banxTokenSettings,
      banxAdventures: banxStake.banxAdventures,
      banxTokenStake: banxStake.banxTokenStake,
    }

    const txnParam = {
      tokensToStake: Number(value),
      userPubkey: wallet.publicKey,
      optimistic,
    }

    new TxnExecutor(stakeBanxTokenAction, { wallet, connection })
      .addTxnParam(txnParam)
      .on('pfSuccessEach', (results) => {
        results.forEach(({ result }) => {
          console.log('SUCCESS ', result)
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

  return (
    <Modal className={styles.modal} open onCancel={close} footer={false} width={572} centered>
      <Tabs value={currentTabValue} {...tabProps} />
      <div className={styles.container}>
        {currentTabValue === ModalTabs.STAKE && (
          <div className={styles.row}>
            <span className={styles.uppercaseText}>wallet balance</span>
            <span className={styles.valueText}>12.5M</span>
            <BanxLogo />
          </div>
        )}

        {currentTabValue === ModalTabs.UNSTAKE && (
          <div className={styles.row}>
            <span className={styles.uppercaseText}>total staked</span>
            <span className={styles.valueText}>{format(banxTokenSettings?.tokensStaked || 0)}</span>
            <BanxLogo />
            <span className={styles.valueText}>
              {format(calcPts(banxTokenSettings?.tokensStaked || 0))} pts
            </span>
          </div>
        )}

        <div className={styles.input}>
          <NumericInput positiveOnly onChange={setValue} value={value} />
          <Button size="small" variant={'secondary'}>
            Use max
          </Button>
        </div>

        {currentTabValue === ModalTabs.STAKE && (
          <>
            <div className={styles.row__btw}>
              <span className={styles.uppercaseText}>idle on wallet</span>
              <div>
                <span className={styles.valueText}>11,500,000</span>
                <BanxLogo />
              </div>
            </div>

            <div className={styles.row__btw}>
              <span className={styles.uppercaseText}>you will get</span>
              <div>
                <span className={styles.valueText}>{format(willGetPts || 0)} pts</span>
              </div>
            </div>
          </>
        )}

        {currentTabValue === ModalTabs.UNSTAKE && (
          <>
            <div className={styles.row__btw}>
              <span className={styles.uppercaseText}>staked</span>
              <div>
                <span className={styles.valueText}>11,500,000</span>
                <BanxLogo />
              </div>
            </div>

            <div className={styles.row__btw}>
              <span className={styles.uppercaseText}>you will unstake</span>
              <div>
                <span className={styles.valueText}>{format(willGetPts || 0)} pts</span>
              </div>
            </div>
          </>
        )}

        <Button
          disabled={!Number(value)}
          size="default"
          variant={'primary'}
          className={styles.btn}
          onClick={onStakeTokens}
        >
          Stake
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
