import { ChangeEvent, FC, useEffect, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { Skeleton } from 'antd'

import { Button } from '@banx/components/Buttons'
import { WalletItem } from '@banx/components/WalletModal'
import { Modal } from '@banx/components/modals/BaseModal'

import BanxImage from '@banx/assets/BanxUrban1.png'
import GreenGridBg from '@banx/assets/GreenGridBg.png'
import {
  extractReferralCodeFromPath,
  useDebounceValue,
  useReferralLink,
  useWalletAdapters,
} from '@banx/hooks'
import { CircleCheck, Paste } from '@banx/icons'
import { useModal } from '@banx/store/common'
import { pasteFromClipboard } from '@banx/utils'

import { Loader } from '../Loader'
import { ReferralInput } from './components'
import { useGetUserWalletByRefCode } from './hooks'

import styles from './RefferralModal.module.less'

const RefferralModal = () => {
  const { connected, disconnect } = useWallet()
  const { close } = useModal()

  const referralCode = extractReferralCodeFromPath(location.pathname)

  const { onRefLink, removeRefFromPath } = useReferralLink()

  const [inputValue, setInputValue] = useState('')
  const debouncedInputValue = useDebounceValue(inputValue, 600)

  useEffect(() => {
    if (referralCode) {
      setInputValue(referralCode)
    }
  }, [referralCode])

  const { data: referrerWallet, isLoading: isLoadingReferrerWallet } =
    useGetUserWalletByRefCode(debouncedInputValue)

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
      <div className={styles.content}>
        <div
          className={styles.referralModalContent}
          style={{ backgroundImage: `url(${GreenGridBg})` }}
        >
          <h4 className={styles.title}>Welcome to Banx</h4>
          <span className={styles.subtitle}>
            Banx is pioneering the NFT lending space on Solana as the only perpetual P2P NFT lending
            protocol, offering a true DeFi lending experience
          </span>

          <div className={styles.referralModalInfo}>
            <img className={styles.banxImage} src={BanxImage} />
            <div className={styles.referralModalInfoRows}>
              <div className={styles.referralModalInfoRow}>
                <CircleCheck />
                <span>50% upfront fee cashback + 2X points on your first Borrow</span>
              </div>
              <div className={styles.referralModalInfoRow}>
                <CircleCheck />
                <span>4X points on first your Lend</span>
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
              <div className={styles.changeWallet}>
                <span onClick={disconnect}>Change wallet</span>
              </div>
            </>
          )}

          {!connected && <ConnectWalletContent />}
        </div>
      </div>

      <div className={styles.loaderWrapper}>
        <Loader size="large" />
      </div>
    </Modal>
  )
}

export default RefferralModal

const ConnectWalletContent = () => {
  const [visibleWalletList, setVisibleWalletList] = useState(false)

  if (visibleWalletList) {
    return (
      <>
        <WalletsList />
        <Button onClick={() => setVisibleWalletList(false)} className={styles.cancelButton}>
          Cancel
        </Button>
      </>
    )
  }

  return (
    <Button onClick={() => setVisibleWalletList(true)} className={styles.confirmButton}>
      Connect wallet
    </Button>
  )
}

interface ReferrerWalletProps {
  isLoading: boolean
  inputValue: string
  referrerWallet: string
}

const ReferrerWallet: FC<ReferrerWalletProps> = ({ referrerWallet, inputValue, isLoading }) => {
  const showReferrerWallet = !isLoading && !!referrerWallet
  const showSkeleton = isLoading && !!inputValue
  const showErrorMessage = !!inputValue && !isLoading && !referrerWallet

  return (
    <div className={styles.referrerWallet}>
      {showSkeleton && <Skeleton.Input size="small" className={styles.referrerWalletSkeleton} />}
      {showReferrerWallet && <span>Referrer wallet: {referrerWallet?.slice(0, 4)}</span>}
      {showErrorMessage && (
        <span className={styles.referrerWalletError}>Invalid referral code</span>
      )}
    </div>
  )
}

const WalletsList = () => {
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
