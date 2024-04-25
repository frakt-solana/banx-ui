import { useEffect, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BanxStakeState } from 'fbonds-core/lib/fbond-protocol/types'
import { uniqueId } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { Tab, Tabs, useTabs } from '@banx/components/Tabs'
import { Modal } from '@banx/components/modals/BaseModal'

import { BanxStakeNft } from '@banx/api/staking'
import { TensorFilled } from '@banx/icons'
import { useBanxStakeInfo, useBanxStakeSettings } from '@banx/pages/AdventuresPage'
import { NftCheckbox, NftsStats } from '@banx/pages/AdventuresPage/components'
import { useModal } from '@banx/store'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import { createStakeBanxNftTxnData, createUnstakeBanxNftTxnData } from '@banx/transactions/staking'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
} from '@banx/utils'

import { TxnExecutor } from '../../../../../../solana-txn-executor/src'

import styles from './StakeNftsModal.module.less'

export const StakeNftsModal = () => {
  const { connection } = useConnection()
  const wallet = useWallet()

  const { close } = useModal()
  const { banxStakeSettings } = useBanxStakeSettings()
  const { banxStakeInfo } = useBanxStakeInfo()

  const [selectedNfts, setSelectedNfts] = useState<BanxStakeNft[]>([])

  const { value: currentTab, ...tabsProps } = useTabs({
    tabs: MODAL_TABS,
    defaultValue: MODAL_TABS[0].value,
  })

  const isNftSelected = (mint: string) =>
    !!selectedNfts.find(({ mint: nftMint }) => nftMint === mint)

  const onSelect = (nft: BanxStakeNft) => {
    const isSelected = isNftSelected(nft.mint)

    if (isSelected) {
      return setSelectedNfts((prev) => prev.filter(({ mint }) => mint !== nft.mint))
    }

    return setSelectedNfts((prev) => [...prev, nft])
  }
  const onSelectAll = () => {
    const hasSelected = !!selectedNfts.length

    if (hasSelected) {
      return setSelectedNfts([])
    }

    return setSelectedNfts(filteredNfts.filter((nft) => !nft?.isLoaned))
  }

  const filteredNfts = useMemo(() => {
    if (!banxStakeInfo?.nfts?.length) return []

    const { nfts } = banxStakeInfo

    if (currentTab === MODAL_TABS[0].value) {
      return nfts.filter(
        (nft) => !nft?.stake || nft?.stake?.banxStakeState === BanxStakeState.Unstaked,
      )
    }

    return nfts.filter((nft) => nft?.stake?.banxStakeState === BanxStakeState.Staked)
  }, [banxStakeInfo, currentTab])

  const onStake = async () => {
    if (!wallet.publicKey || !banxStakeSettings || !banxStakeInfo) {
      return
    }

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        selectedNfts.map((nft) =>
          createStakeBanxNftTxnData({
            nftMint: nft.mint,
            walletAndConnection,
          }),
        ),
      )

      await new TxnExecutor(walletAndConnection, TXN_EXECUTOR_DEFAULT_OPTIONS)
        .addTransactionParams(txnsData)
        .on('sentAll', () => {
          enqueueTransactionsSent()
          enqueueWaitingConfirmation(loadingSnackbarId)
          close()
        })
        .on('confirmedAll', (results) => {
          destroySnackbar(loadingSnackbarId)

          const { confirmed, failed } = results

          if (confirmed.length) {
            enqueueSnackbar({ message: 'Staked successfully', type: 'success' })
          }

          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: selectedNfts,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'StakeBanx',
      })
    }
  }
  const onUnstake = async () => {
    if (!wallet.publicKey?.toBase58() || !banxStakeSettings || !banxStakeInfo) {
      return
    }

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        selectedNfts.map((nft) =>
          createUnstakeBanxNftTxnData({
            nftMint: nft.mint,
            nftStakePublicKey: nft.stake?.publicKey ?? '',
            walletAndConnection,
          }),
        ),
      )

      new TxnExecutor(walletAndConnection, TXN_EXECUTOR_DEFAULT_OPTIONS)
        .addTransactionParams(txnsData)
        .on('sentAll', () => {
          enqueueTransactionsSent()
          enqueueWaitingConfirmation(loadingSnackbarId)
          close()
        })
        .on('confirmedAll', (results) => {
          destroySnackbar(loadingSnackbarId)

          const { confirmed, failed } = results

          if (confirmed.length) {
            enqueueSnackbar({ message: 'Unstaked successfully', type: 'success' })
          }

          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: selectedNfts,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'UnstakeBanx',
      })
    }
  }

  useEffect(() => {
    setSelectedNfts([])
  }, [currentTab])

  const disabledSelect = !!filteredNfts.filter(({ isLoaned }) => !isLoaned).length

  return (
    <Modal className={styles.modal} open onCancel={close} footer={false} width={768} centered>
      <Tabs className={styles.tabs} value={currentTab} {...tabsProps} />

      <div className={styles.content}>
        <NftsStats nfts={filteredNfts} />
        {!filteredNfts.length && (
          <div className={styles.emptyNfts}>
            You don’t have suitable NFTs or your Banx is listed
          </div>
        )}
        {!!filteredNfts.length && (
          <ul className={styles.nfts}>
            {filteredNfts.map((nft) => (
              <NftCheckbox
                disabled={nft?.isLoaned}
                key={nft.mint}
                nft={nft}
                onClick={() => onSelect(nft)}
                selected={isNftSelected(nft.mint)}
              />
            ))}
          </ul>
        )}
      </div>
      <div className={styles.footerEmpty}>
        {!filteredNfts.length && (
          <Button className={styles.footerTensorBtn}>
            <a href="https://www.tensor.trade/trade/banx" target="_blank" rel="noreferrer">
              <TensorFilled />
              <span>Buy Banx on Tensor</span>
            </a>
          </Button>
        )}
      </div>
      {!!filteredNfts.length && (
        <div className={styles.footer}>
          <>
            <Button
              variant="secondary"
              className={styles.footerBtn}
              disabled={!disabledSelect}
              onClick={onSelectAll}
            >
              {!Object.values(selectedNfts).length ? 'Select all' : 'Deselect all'}
            </Button>
            <Button
              variant="primary"
              className={styles.footerBtn}
              disabled={!Object.values(selectedNfts).length}
              onClick={currentTab === MODAL_TABS[0].value ? onStake : onUnstake}
            >
              {currentTab === MODAL_TABS[0].value && 'Stake'}
              {currentTab === MODAL_TABS[1].value && 'Unstake'}
            </Button>
          </>
        </div>
      )}
    </Modal>
  )
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
