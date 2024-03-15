import React, { useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import { BanxSubscribeAdventureOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { Tab, Tabs, useTabs } from '@banx/components/Tabs'
import { Modal } from '@banx/components/modals/BaseModal'

import { NftType } from '@banx/api/banxTokenStake'
import { BANX_STAKING } from '@banx/constants'
import { NftCheckbox } from '@banx/pages/AdventuresPage/components/StakeNftsModal/NftCheckBox'
import { NftsStats } from '@banx/pages/AdventuresPage/components/StakeNftsModal/NftsStats'
import { useBanxStakeState } from '@banx/pages/AdventuresPage/state'
import { useModal } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { stakeBanxNftAction } from '@banx/transactions/banxStaking/stakeBanxNftsAction'
import { enqueueSnackbar } from '@banx/utils'

import styles from './styled.module.less'

export const StakeNftsModal = () => {
  const { close } = useModal()
  const { banxStake, banxTokenSettings, updateStake } = useBanxStakeState()
  const nfts = banxStake?.nfts || []
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
    const isSelectedAll = Object.values(selectedNfts).length === nfts.length

    if (isSelectedAll) {
      setSelectedNfts({})
      return
    }

    if (!isSelectedAll) {
      const nftsMap = nfts.reduce<{ [k: string]: NftType }>((acc, nft) => {
        acc[nft.mint] = nft
        return acc
      }, {})

      setSelectedNfts(nftsMap)
      return
    }
  }

  const filteredNfts = useMemo(() => {
    if (currentTab === modalTabs[0].value) {
      return nfts.filter((nft) => nft?.stake?.banxStakeState === 'unstaked')
    }

    return nfts.filter((nft) => nft?.stake?.banxStakeState === 'staked')
  }, [nfts?.length, wallet.publicKey?.toBase58(), currentTab])

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
      }))

      new TxnExecutor(stakeBanxNftAction, { wallet, connection })
        .addTxnParams(params)
        .on('pfSuccessEach', (results) => {
          const { txnHash } = results[0]
          enqueueSnackbar({
            message: 'Staked successfully',
            type: 'success',
            solanaExplorerPath: `tx/${txnHash}`,
          })
          results.forEach(({ result }) => {
            if (
              !result?.banxStakingSettings ||
              !result?.banxAdventures ||
              !result?.banxTokenStake
            ) {
              return
            }

            updateStake({
              banxTokenSettings: result?.banxStakingSettings,
              banxStake: {
                ...banxStake,
                banxAdventures: result?.banxAdventures as any,
                banxTokenStake: result?.banxTokenStake,
              },
            })
          })
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

  return (
    <Modal className={styles.modal} open onCancel={close} footer={false} width={768} centered>
      <Tabs className={styles.tabs} value={currentTab} {...tabsProps} />

      <div className={styles.content}>
        <NftsStats nfts={nfts} />
        <ul className={styles.nfts}>
          {filteredNfts.map((nft) => (
            <NftCheckbox
              key={nft.mint}
              nft={nft}
              onClick={onSelect}
              selected={!!selectedNfts[nft.mint]}
            />
          ))}
        </ul>
      </div>
      <div className={styles.footer}>
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
          onClick={onStake}
        >
          {currentTab === modalTabs[0].value && 'Stake'}
          {currentTab === modalTabs[1].value && 'Unstake'}
        </Button>
      </div>
    </Modal>
  )
}
