import { WalletContextState } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'

interface WalletAndConnection {
  wallet: WalletContextState
  connection: web3.Connection
}

type TxnData<TAdditionalResult> = {
  instructions: web3.TransactionInstruction[]
  signers?: web3.Signer[]
  additionalResult?: TAdditionalResult
  lookupTables: web3.PublicKey[]
}

type MakeActionFn<TParams, TAdditionalResult> = (
  params: TParams & WalletAndConnection,
) => Promise<TxnData<TAdditionalResult>>

enum HandlerType {
  BEFORE_FIRST_APPROVE = 'beforeFirstApprove',
  //? PF === preflight
  PF_SUCCESS = 'pfSuccess',
  PF_ERROR = 'pfError',

  BEFORE_APPROVE_EVERY = 'beforeApproveEvery',
  PF_SUCCESS_EVERY = 'pfSuccessEvery',
  PF_ERROR_EVERY = 'pfErrorEvery',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventHandler = (params: any) => void

type EventHanlders = Record<HandlerType, EventHandler>

const DEFAULT_HANDLERS: EventHanlders = {
  [HandlerType.BEFORE_FIRST_APPROVE]: () => {},
  [HandlerType.PF_SUCCESS]: () => {},
  [HandlerType.PF_ERROR]: () => {},
  [HandlerType.BEFORE_APPROVE_EVERY]: () => {},
  [HandlerType.PF_SUCCESS_EVERY]: () => {},
  [HandlerType.PF_ERROR_EVERY]: () => {},
}

type ExecutorOptions = {
  actionsPerTxn: number //? amount of results of makeIxnsFn call per txn
  commitment: web3.Commitment
  signAllChunks: number
  skipPreflight: boolean
  preflightCommitment: web3.Commitment
  rejectQueueOnFirstPfError: boolean //? Stop sending other txns after first preflight error. Mostly relevant for the ledger
  //TODO: Add webscoket result handling in future
}

const DEFAULT_EXECUTOR_OPTIONS: ExecutorOptions = {
  actionsPerTxn: 1,
  commitment: 'confirmed',
  signAllChunks: 40, //? Set different for ledger
  skipPreflight: false,
  preflightCommitment: 'processed',
  rejectQueueOnFirstPfError: false,
}

export class TxnExecutor<TParams, TOptimisticResult> {
  private makeIxnsFn: MakeActionFn<TParams, TOptimisticResult>
  private ixnsParams: TParams[] = []
  private options: ExecutorOptions = DEFAULT_EXECUTOR_OPTIONS
  private walletAndConnection: WalletAndConnection
  private eventHandlers: EventHanlders = DEFAULT_HANDLERS
  constructor(
    makeIxnFn: MakeActionFn<TParams, TOptimisticResult>,
    walletAndConnection: WalletAndConnection,
    options?: Partial<ExecutorOptions>,
  ) {
    this.makeIxnsFn = makeIxnFn
    this.walletAndConnection = walletAndConnection
    this.options = {
      ...this.options,
      ...options,
    }
  }

  public setIxnParams(params: TParams | TParams[]) {
    this.ixnsParams = params instanceof Array ? params : [params]
    return this
  }

  //TODO: Add normal types for handlers: success, error
  public on(type: HandlerType, handler: EventHandler) {
    this.eventHandlers[type] = handler
  }

  public async execute() {
    const { ixnsParams, makeIxnsFn, walletAndConnection, options } = this
    const { wallet, connection } = walletAndConnection

    const txnsData = await Promise.all(
      ixnsParams.map((params) => makeIxnsFn({ ...params, ...walletAndConnection })),
    )

    const txns = await Promise.all(
      txnsData.map((txnData) => createTransaction(txnData, walletAndConnection)),
    )

    if (!wallet.signAllTransactions) return
    await wallet.signAllTransactions(txns)

    await Promise.all(
      txns.map(
        async (txn) =>
          await connection.sendRawTransaction(txn.serialize(), {
            skipPreflight: options.skipPreflight,
            preflightCommitment: options.preflightCommitment,
          }),
      ),
    )
  }
}

const createTransaction = async <T>(
  txnData: TxnData<T>,
  walletAndConnection: WalletAndConnection,
) => {
  const { connection, wallet } = walletAndConnection

  const { lookupTables } = txnData

  const { blockhash } = await connection.getLatestBlockhash()

  const lookupTableAccounts = await Promise.all(
    lookupTables.map(
      async (lt) =>
        (await connection.getAddressLookupTable(lt)).value as web3.AddressLookupTableAccount,
    ),
  )

  const txnMessageV0 = new web3.VersionedTransaction(
    new web3.TransactionMessage({
      payerKey: wallet.publicKey as web3.PublicKey,
      recentBlockhash: blockhash,
      instructions: txnData.instructions,
    }).compileToV0Message(lookupTableAccounts),
  )
  if (txnData.signers) {
    txnMessageV0.sign(txnData.signers)
  }

  return txnMessageV0
}
