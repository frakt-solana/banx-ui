import React, { useEffect, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import { BanxSubscribeAdventureOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { BanxStakeState } from 'fbonds-core/lib/fbond-protocol/types'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { Tab, Tabs, useTabs } from '@banx/components/Tabs'
import { Modal } from '@banx/components/modals/BaseModal'

import { NftType } from '@banx/api/banxTokenStake'
import { BANX_STAKING } from '@banx/constants'
import { TensorFilled } from '@banx/icons'
import { NftCheckbox, NftsStats } from '@banx/pages/AdventuresPage/components'
import { useBanxStakeState } from '@banx/pages/AdventuresPage/state'
import { useModal } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { stakeBanxNftAction, unstakeBanxNftsAction } from '@banx/transactions/banxStaking'
import { enqueueSnackbar, usePriorityFees } from '@banx/utils'

import styles from './styles.module.less'

export const StakeNftsModal = () => {
  const { close } = useModal()
  const priorityFees = usePriorityFees()
  const { banxStake, banxTokenSettings, updateStake } = useBanxStakeState()
  const nfts = useMemo(() => banxStake?.nfts || [], [banxStake?.nfts])
  const wallet = useWallet()
  const { connection } = useConnection()
  const [selectedNfts, setSelectedNfts] = useState<{ [k: string]: NftType }>({})

  const modalTabs: Tab[] = useMemo(() => {
    return [
      {
        label: 'Stake',
        value: 'stake',
      },
      {
        label: 'Unstake',
        value: 'unstake',
      },
    ]
  }, [])

  const { value: currentTab, ...tabsProps } = useTabs({
    tabs: modalTabs,
    defaultValue: modalTabs[0].value,
  })

  const onSelect = (nft: NftType) => {
    if (selectedNfts[nft.mint]) {
      delete selectedNfts[nft.mint]
      setSelectedNfts({ ...selectedNfts })
      return
    }

    if (!selectedNfts[nft.mint]) {
      setSelectedNfts({
        ...selectedNfts,
        [nft.mint]: nft,
      })
      return
    }
  }

  const onSelectAll = () => {
    const isSelectedAll = !!Object.values(selectedNfts).length

    if (isSelectedAll) {
      setSelectedNfts({})
      return
    }

    if (!isSelectedAll) {
      const nftsMap = filteredNfts
        .filter((nft) => !nft?.stake?.isLoaned)
        .reduce<{ [k: string]: NftType }>((acc, nft) => {
          acc[nft.mint] = nft
          return acc
        }, {})

      setSelectedNfts(nftsMap)
      return
    }
  }

  const filteredNfts = useMemo(() => {
    if (currentTab === modalTabs[0].value) {
      return nfts.filter(
        (nft) => !nft.isLoaned && nft?.stake?.banxStakeState === BanxStakeState.Unstaked,
      )
    }

    return nfts.filter((nft) => nft?.stake?.banxStakeState !== BanxStakeState.Unstaked)
  }, [nfts, currentTab, modalTabs])

  const onStake = () => {
    try {
      if (!wallet.publicKey || !banxTokenSettings || !banxStake?.banxTokenStake) {
        return
      }
      const optimistic: BanxSubscribeAdventureOptimistic = {
        banxStakingSettings: banxTokenSettings,
        banxAdventures: banxStake.banxAdventures,
        banxTokenStake: banxStake.banxTokenStake,
      }

      const params = Object.values(selectedNfts).map((nft) => ({
        tokenMint: new web3.PublicKey(nft.mint),
        whitelistEntry: new web3.PublicKey(BANX_STAKING.WHITELIST_ENTRY_PUBKEY),
        hadoRegistry: new web3.PublicKey(BANX_STAKING.HADO_REGISTRY_PUBKEY),
        banxPointsMap: nft.pointsMap,
        optimistic,
        priorityFees,
      }))

      new TxnExecutor(stakeBanxNftAction, { wallet, connection })
        .addTxnParams(params)
        .on('pfSuccessEach', (results) => {
          const { txnHash } = results[0]
          enqueueSnackbar({
            message: 'Nft successfully staked',
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
            transactionName: 'StakeBanx',
          })
        })
        .execute()
    } catch (error) {
      console.error(error)
    }
  }
  const onUnstake = () => {
    try {
      if (!wallet.publicKey?.toBase58() || !banxTokenSettings || !banxStake?.banxTokenStake) {
        return
      }
      const banxSubscribeAdventureOptimistic: BanxSubscribeAdventureOptimistic = {
        banxStakingSettings: banxTokenSettings,
        banxAdventures: banxStake.banxAdventures,
        banxTokenStake: banxStake.banxTokenStake,
      }

      const params = Object.values(selectedNfts).map((nft) => ({
        tokenMint: new web3.PublicKey(nft.mint),
        userPubkey: wallet.publicKey as web3.PublicKey,
        optimistic: {
          banxSubscribeAdventureOptimistic,
          banxStake: nft.stake,
        },
        priorityFees,
      }))

      new TxnExecutor(unstakeBanxNftsAction, { wallet, connection })
        .addTxnParams(params)
        .on('pfSuccessEach', (results) => {
          const { txnHash } = results[0]
          enqueueSnackbar({
            message: 'Nft successfully unstaked',
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
            transactionName: 'UnstakeBanx',
          })
        })
        .execute()
    } catch (error) {
      console.error(error)
    }
  }

  const getStatsNfts = () => {
    if (currentTab === modalTabs[0].value) {
      return nfts.filter(
        ({ stake, isLoaned }) => !isLoaned && stake?.banxStakeState === BanxStakeState.Unstaked,
      )
    }

    return nfts.filter(({ stake }) => stake?.banxStakeState !== BanxStakeState.Unstaked)
  }

  useEffect(() => {
    setSelectedNfts({})
  }, [currentTab])

  return (
    <Modal className={styles.modal} open onCancel={close} footer={false} width={768} centered>
      <Tabs className={styles.tabs} value={currentTab} {...tabsProps} />

      <div className={styles.content}>
        <NftsStats nfts={getStatsNfts()} />
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
                onClick={onSelect}
                selected={!!selectedNfts[nft.mint]}
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
              disabled={!nfts.length}
              onClick={onSelectAll}
            >
              {!Object.values(selectedNfts).length ? 'Select all' : 'Deselect all'}
            </Button>
            <Button
              variant="primary"
              className={styles.footerBtn}
              disabled={!Object.values(selectedNfts).length}
              onClick={currentTab === modalTabs[0].value ? onStake : onUnstake}
            >
              {currentTab === modalTabs[0].value && 'Stake'}
              {currentTab === modalTabs[1].value && 'Unstake'}
            </Button>
          </>
        </div>
      )}
    </Modal>
  )
}
