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

type SavedData = {
  walletPubkey: string
  jwt: string
  data: LinkedWallet[] | null
}

interface SavedDataState {
  data: SavedData | null
  setData: (nextValue: SavedData | null) => void
}

const useSavedDataState = create<SavedDataState>((set) => ({
  data: null,
  setData: (nextValue) => {
    set((state) => {
      return { ...state, data: nextValue }
    })
  },
}))

export const LinkWalletsModal = () => {
  const { close } = useModal()
  const { publicKey } = useWallet()

  const { checkAccess } = useBanxLogin()

  const { data: beginLinkingData, setData: setBeginLinkingData } = useSavedDataState()

  useEffect(() => {
    if (!publicKey || beginLinkingData) return
    checkAccess(publicKey)
  }, [publicKey, checkAccess, beginLinkingData])

  //? Send request for wallets only if vierified

  return (
    <Modal
      className={styles.modal}
      open
      onCancel={() => {
        setBeginLinkingData(null)
        close()
      }}
      width={572}
    >
      <WalletInfo beginLinkingData={beginLinkingData} setBeginLinkingData={setBeginLinkingData} />
      <LinkWalletsModalContent
        beginLinkingData={beginLinkingData}
        setBeginLinkingData={setBeginLinkingData}
      />
    </Modal>
  )
}

type LinkWalletsModalContentProps = {
  beginLinkingData: SavedData | null
  setBeginLinkingData: (nextValue: SavedData | null) => void
}

const LinkWalletsModalContent: FC<LinkWalletsModalContentProps> = ({
  beginLinkingData,
  setBeginLinkingData,
}) => {
  const { connected } = useWallet()

  const { isLoggedIn } = useBanxLogin()

  //? Wallet not connected and linking data isnt in progress (for some reason)
  if (!connected && !beginLinkingData) {
    return <p>Connect wallet</p>
  }

  //? Wallet not verified and linking data isnt in progress
  if (connected && !isLoggedIn && !beginLinkingData) {
    return (
      <VerifyWalletBlock
        beginLinkingData={beginLinkingData}
        setBeginLinkingData={setBeginLinkingData}
      />
    )
  }

  return (
    <LinkingBlock beginLinkingData={beginLinkingData} setBeginLinkingData={setBeginLinkingData} />
  )
}

type VerifyWalletBlockProps = {
  beginLinkingData: SavedData | null
  setBeginLinkingData: (nextValue: SavedData | null) => void
}

const VerifyWalletBlock: FC<VerifyWalletBlockProps> = () => {
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
  beginLinkingData: SavedData | null
  setBeginLinkingData: (nextValue: SavedData | null) => void
}

const LinkingBlock: FC<VerifiedBlockProps> = ({ beginLinkingData, setBeginLinkingData }) => {
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
    setBeginLinkingData({
      walletPubkey: wallet.publicKey.toBase58(),
      jwt,
      data: data || null,
    })
  }

  if (!beginLinkingData) {
    return <Button onClick={onBeginLinking}>Begin linking</Button>
  }

  const isDiffWalletConnected =
    !!wallet.publicKey &&
    !!beginLinkingData &&
    wallet.publicKey.toBase58() !== beginLinkingData?.walletPubkey

  if (beginLinkingData && !wallet.connected) {
    return (
      <>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <pre>Linking in Progress</pre>
          <Button
            onClick={() => {
              setBeginLinkingData(null)
              close()
            }}
            variant="secondary"
            type="circle"
          >
            x
          </Button>
        </div>
        <hr />
        <SelectWalletsBlock />
      </>
    )
  }

  if (!isDiffWalletConnected) {
    return (
      <>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <pre>Linking in Progress</pre>
          <Button
            onClick={() => {
              setBeginLinkingData(null)
            }}
            variant="secondary"
            type="circle"
          >
            x
          </Button>
        </div>
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
      linkedWalletJwt: beginLinkingData.jwt,
      wallet: wallet.publicKey.toBase58(),
      signature,
    })

    logIn({
      signature,
      walletPubkey: wallet.publicKey,
    })
    setBeginLinkingData(null)
  }

  if (isDiffWalletConnected) {
    return (
      <>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <pre>Linking in Progress</pre>
          <Button
            onClick={() => {
              setBeginLinkingData(null)
            }}
            variant="secondary"
            type="circle"
          >
            x
          </Button>
        </div>
        <hr />
        Add new wallet <pre>{wallet.publicKey?.toBase58()}</pre>
        <Checkbox onChange={() => setIsLedger(!isLedger)} label="I use ledger" checked={isLedger} />
        <Button onClick={onVerify}>Verify</Button>
      </>
    )
  }
}

type WalletInfoProps = {
  beginLinkingData: SavedData | null
  setBeginLinkingData: (nextValue: SavedData | null) => void
}

//? Info about linked wallets here
//? + Optimistic
const WalletInfo: FC<WalletInfoProps> = ({ beginLinkingData }) => {
  const { publicKey } = useWallet()
  const { isLoggedIn, jwt } = useBanxLogin()

  const { data } = useQuery(['fetchLinkedWallets', publicKey], () =>
    fetchLinkedWallets({ walletPublicKey: publicKey?.toBase58() || '' }),
  )

  const accessToUnlink =
    publicKey && data?.some(({ wallet }) => wallet === publicKey?.toBase58()) && isLoggedIn

  if (!beginLinkingData && !data) {
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
      {(beginLinkingData?.data || data)?.map(({ type, wallet }, idx) => {
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
