import { FC, useEffect } from 'react'

import { WalletName } from '@solana/wallet-adapter-base'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { create } from 'zustand'

import { Button } from '@banx/components/Buttons'
import Checkbox from '@banx/components/Checkbox'
import { Loader } from '@banx/components/Loader'
import { WalletItem } from '@banx/components/WalletModal/components'
import { Modal } from '@banx/components/modals/BaseModal'

import { LinkedWallet, fetchLinkedWallets, linkWallet, unlinkWallet } from '@banx/api/user'
import { useBanxLogin, useIsLedger, useModal } from '@banx/store'
import { generateSignature } from '@banx/utils'

import styles from './LinkWalletsModal.module.less'

type SavedLinkingData = {
  walletPubkey: string
  jwt: string
  data: LinkedWallet[] | null
}

type SavedLinkingDataState = {
  savedLinkingData: SavedLinkingData | null
  setSavedLinkingData: (nextValue: SavedLinkingData | null) => void
}

const useSavedDataState = create<SavedLinkingDataState>((set) => ({
  savedLinkingData: null,
  setSavedLinkingData: (nextValue) => set((state) => ({ ...state, savedLinkingData: nextValue })),
}))

export const LinkWalletsModal = () => {
  const { close } = useModal()
  const { publicKey } = useWallet()
  const { checkAccess } = useBanxLogin()
  const { savedLinkingData, setSavedLinkingData } = useSavedDataState()

  useEffect(() => {
    if (!publicKey || savedLinkingData) return
    checkAccess(publicKey)
  }, [publicKey, checkAccess, savedLinkingData])

  return (
    <Modal
      className={styles.modal}
      open
      onCancel={() => {
        setSavedLinkingData(null)
        close()
      }}
      width={572}
    >
      <WalletInfo savedLinkingData={savedLinkingData} />
      <LinkWalletsModalContent
        savedLinkingData={savedLinkingData}
        setSavedLinkingData={setSavedLinkingData}
      />
    </Modal>
  )
}

type LinkWalletsModalContentProps = {
  savedLinkingData: SavedLinkingData | null
  setSavedLinkingData: (nextValue: SavedLinkingData | null) => void
}

const LinkWalletsModalContent: FC<LinkWalletsModalContentProps> = ({
  savedLinkingData,
  setSavedLinkingData,
}) => {
  const { connected } = useWallet()

  const { isLoggedIn } = useBanxLogin()

  //? Wallet not connected and linking data isnt in progress (for some reason)
  if (!connected && !savedLinkingData) {
    return <p>Connect wallet</p>
  }

  //? Wallet not verified and linking data isnt in progress
  if (connected && !isLoggedIn && !savedLinkingData) {
    return <VerifyWalletBlock />
  }

  return (
    <LinkingBlock savedLinkingData={savedLinkingData} setSavedLinkingData={setSavedLinkingData} />
  )
}

const VerifyWalletBlock: FC = () => {
  const wallet = useWallet()
  const { isLedger, setIsLedger } = useIsLedger()
  const { connection } = useConnection()
  const { isLoggedIn, isLoggingIn, AUTH_MESSAGE, logIn } = useBanxLogin()

  if (isLoggingIn) {
    return <Loader />
  }

  const onLogin = async () => {
    if (!wallet.publicKey) return

    const signature = await generateSignature({
      isLedger,
      nonce: AUTH_MESSAGE,
      wallet,
      connection,
    })

    if (!signature) return

    logIn({
      signature,
      walletPubkey: wallet.publicKey,
    })
  }

  return (
    <div>
      {wallet.connected && (
        <>
          <Checkbox
            onChange={() => setIsLedger(!isLedger)}
            label="I use ledger"
            checked={isLedger}
          />
          {!isLoggingIn && !isLoggedIn && <Button onClick={onLogin}>Verify wallet</Button>}
        </>
      )}
    </div>
  )
}

type VerifiedBlockProps = {
  savedLinkingData: SavedLinkingData | null
  setSavedLinkingData: (nextValue: SavedLinkingData | null) => void
}

const LinkingBlock: FC<VerifiedBlockProps> = ({ savedLinkingData, setSavedLinkingData }) => {
  const { close } = useModal()
  const wallet = useWallet()
  const { connection } = useConnection()

  const { data } = useQuery(['fetchLinkedWallets', wallet.publicKey], () =>
    fetchLinkedWallets({ walletPublicKey: wallet.publicKey?.toBase58() || '' }),
  )

  const { jwt, AUTH_MESSAGE, logIn } = useBanxLogin()
  const { isLedger, setIsLedger } = useIsLedger()

  const onBeginLinking = () => {
    if (!wallet.publicKey || !jwt) return
    setSavedLinkingData({
      walletPubkey: wallet.publicKey.toBase58(),
      jwt,
      data: data || null,
    })
  }

  if (!savedLinkingData) {
    return <Button onClick={onBeginLinking}>Begin linking</Button>
  }

  const isDiffWalletConnected =
    !!wallet.publicKey &&
    !!savedLinkingData &&
    wallet.publicKey.toBase58() !== savedLinkingData?.walletPubkey

  if (savedLinkingData && !wallet.connected) {
    return (
      <>
        <LinkingInProgressBlock
          onCancel={() => {
            setSavedLinkingData(null)
            close()
          }}
        />
        <hr />
        <SelectWalletsBlock />
      </>
    )
  }

  if (!isDiffWalletConnected) {
    return (
      <>
        <LinkingInProgressBlock
          onCancel={() => {
            setSavedLinkingData(null)
          }}
        />
        <hr />
        <Button
          onClick={() => {
            wallet.disconnect()
          }}
        >
          Change wallet
        </Button>
      </>
    )
  }

  const onVerify = async () => {
    if (!wallet.publicKey) return

    const signature = await generateSignature({
      isLedger,
      nonce: AUTH_MESSAGE,
      wallet,
      connection,
    })

    if (!signature) return

    //? Optimistic here
    await linkWallet({
      linkedWalletJwt: savedLinkingData.jwt,
      wallet: wallet.publicKey.toBase58(),
      signature,
    })

    logIn({
      signature,
      walletPubkey: wallet.publicKey,
    })
    setSavedLinkingData(null)
  }

  if (isDiffWalletConnected) {
    return (
      <>
        <LinkingInProgressBlock
          onCancel={() => {
            setSavedLinkingData(null)
          }}
        />
        <hr />
        Add new wallet <pre>{wallet.publicKey?.toBase58()}</pre>
        <Checkbox onChange={() => setIsLedger(!isLedger)} label="I use ledger" checked={isLedger} />
        <Button onClick={onVerify}>Verify</Button>
      </>
    )
  }
}

type LinkingInProgressBlockProps = {
  onCancel: () => void
}

const LinkingInProgressBlock: FC<LinkingInProgressBlockProps> = ({ onCancel }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <pre>Linking in Progress</pre>
      <Button onClick={onCancel} variant="secondary" type="circle">
        x
      </Button>
    </div>
  )
}

type WalletInfoProps = {
  savedLinkingData: SavedLinkingData | null
}

//? Info about linked wallets here
//? + Optimistic
const WalletInfo: FC<WalletInfoProps> = ({ savedLinkingData }) => {
  const { publicKey } = useWallet()
  const { isLoggedIn, jwt } = useBanxLogin()

  const { data } = useQuery(['fetchLinkedWallets', publicKey], () =>
    fetchLinkedWallets({ walletPublicKey: publicKey?.toBase58() || '' }),
  )

  const accessToUnlink =
    publicKey && data?.some(({ wallet }) => wallet === publicKey?.toBase58()) && isLoggedIn

  if (!savedLinkingData && !data) {
    return <p>{publicKey?.toBase58()}</p>
  }

  const onUnlink = async (walletToUnlink: string) => {
    if (!publicKey || !jwt) return

    //? Optimistic here
    await unlinkWallet({
      jwt,
      walletToUnlink,
    })
  }

  return (
    <div>
      {(savedLinkingData?.data || data)?.map(({ type, wallet }, idx) => {
        return (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <pre>
              {wallet}
              {type === 'main' && '🏠'}
            </pre>

            {wallet === publicKey?.toBase58() && <Button>Active</Button>}

            {type === 'linked' && accessToUnlink && (
              <Button
                variant="secondary"
                onClick={() => {
                  onUnlink(wallet)
                }}
              >
                Unlink
              </Button>
            )}
          </div>
        )
      })}
      <hr />
    </div>
  )
}

const SelectWalletsBlock = () => {
  const { wallets, select } = useWallet()

  const handleWalletSelect = (walletName: WalletName) => {
    select(walletName)
  }

  return (
    <div>
      {wallets.map(({ adapter }, idx) => (
        <WalletItem
          key={idx}
          onClick={() => handleWalletSelect(adapter.name)}
          image={adapter.icon}
          name={adapter.name}
        />
      ))}
    </div>
  )
}
