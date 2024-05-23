import { ChangeEvent, FC, useEffect, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { Skeleton } from 'antd'

import { Button } from '@banx/components/Buttons'
import { WalletItem } from '@banx/components/WalletModal'
import { Modal } from '@banx/components/modals/BaseModal'

import {
  extractReferralCodeFromPath,
  useDebounceValue,
  useReferralLink,
  useWalletAdapters,
} from '@banx/hooks'
import { Cashback, Paste } from '@banx/icons'
import { useModal } from '@banx/store/common'
import { pasteFromClipboard } from '@banx/utils'

import Background from './assets/Background.png'
import BanxImage from './assets/Banx.png'
import { ReferralInput } from './components'
import { useSearchUserWallet } from './hooks'

import styles from './RefferralModal.module.less'

const RefferralModal = () => {
  const { connected } = useWallet()
  const { close } = useModal()

  const referralCode = extractReferralCodeFromPath(location.pathname)

  const [visibleWalletList, setVisibleWalletList] = useState(false)

  const { onRefLink, removeRefFromPath } = useReferralLink()

  const [inputValue, setInputValue] = useState('')
  const debouncedRefCode = useDebounceValue(inputValue, 500)

  useEffect(() => {
    if (referralCode) {
      setInputValue(referralCode)
    }
  }, [referralCode])

  const { data: referrerWallet, isLoading: isLoadingReferrerWallet } =
    useSearchUserWallet(debouncedRefCode)

  const onClickInputButton = async () => {
    const text = await pasteFromClipboard()
    setInputValue(text)
  }

  const onChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
  }

  const onCloseModal = () => {
    close()
    removeRefFromPath()
  }

  return (
    <Modal open onCancel={onCloseModal} className={styles.modal} width={408}>
      <div
        className={styles.referralModalContent}
        style={{ backgroundImage: `url(${Background})` }}
      >
        <h4 className={styles.title}>Welcome to Banx</h4>
        <span className={styles.subtitle}>
          Banx is pioneering the NFT lending space on Solana as the only perpetual P2P NFT lending
          protocol, offering a true DeFi lending experience with benefits
        </span>

        <div className={styles.referralModalInfo}>
          <img className={styles.banxImage} src={BanxImage} />
          <div className={styles.referralModalInfoRows}>
            <div className={styles.referralModalInfoRow}>
              <Cashback />
              <span>For the first loan you will receive a 100% cashback in $BANX</span>
            </div>
            <div className={styles.referralModalInfoRow}>
              <Cashback />
              <span>You will receive 10% every time your referral pays upfront fee </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.referrerModalInfo}>
        <ReferralInput
          label="Add referrer code"
          value={inputValue}
          onChange={onChangeInput}
          actionButton={{ text: 'Paste', icon: Paste, onClick: onClickInputButton }}
        />

        <ReferrerWallet
          inputValue={inputValue}
          referrerWallet={referrerWallet}
          isLoading={isLoadingReferrerWallet}
        />

        {connected && (
          <>
            <Button
              onClick={() => onRefLink(inputValue)}
              className={styles.confirmButton}
              disabled={!referrerWallet}
            >
              LFG!
            </Button>
            <span className={styles.warningMessage}>
              Please be careful, this action cannot be canceled
            </span>
          </>
        )}

        {!connected && (
          <>
            {visibleWalletList ? (
              <>
                <WalletsList />
                <Button onClick={() => setVisibleWalletList(false)} className={styles.cancelButton}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setVisibleWalletList(true)} className={styles.confirmButton}>
                Connect wallet
              </Button>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}

export default RefferralModal

interface ReferrerWalletProps {
  isLoading: boolean
  inputValue: string
  referrerWallet: string
}

const ReferrerWallet: FC<ReferrerWalletProps> = ({ referrerWallet, inputValue, isLoading }) => {
  const showReferrerWallet = !isLoading && !!referrerWallet
  const showSkeleton = isLoading && !!inputValue

  return (
    <div className={styles.referrerWallet}>
      {showSkeleton && <Skeleton.Input size="small" className={styles.referrerWalletSkeleton} />}
      {showReferrerWallet && <span>Referrer wallet: {referrerWallet?.slice(0, 4)}</span>}
    </div>
  )
}

export const WalletsList = () => {
  const wallets = useWalletAdapters()

  return (
    <div className={styles.walletsList}>
      {wallets.map(({ adapter, select }, idx) => (
        <WalletItem
          key={idx}
          onClick={select}
          image={adapter.icon}
          name={adapter.name}
          className={styles.walletItem}
        />
      ))}
    </div>
  )
}
