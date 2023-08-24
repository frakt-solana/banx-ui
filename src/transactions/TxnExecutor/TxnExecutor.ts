import { chunk } from 'lodash'

import { WalletAndConnection } from '@banx/types'

import { TxnError } from '../types'
import { signAndSendTxns } from './helpers'
import { EventHandler, EventHanlders, ExecutorOptions, HandlerType, MakeActionFn } from './types'

// eslint-disable-next-line @typescript-eslint/no-empty-function
const handlerPlaceholder = () => {}

export const DEFAULT_HANDLERS: EventHanlders = {
  ['beforeFirstApprove']: handlerPlaceholder,
  ['pfSuccessAll']: handlerPlaceholder,
  ['pfSuccessAny']: handlerPlaceholder,
  ['pfError']: handlerPlaceholder,
  ['beforeApproveEveryChunk']: handlerPlaceholder,
  ['pfSuccessEvery']: handlerPlaceholder,
}

export const DEFAULT_EXECUTOR_OPTIONS: ExecutorOptions = {
  commitment: 'confirmed',
  signAllChunks: 40, //? Set different for ledger
  skipPreflight: false,
  preflightCommitment: 'processed',
  rejectQueueOnFirstPfError: false,
}

export class TxnExecutor<TParams, TResult> {
  private makeIxnsFn: MakeActionFn<TParams, TResult>
  private txnsParams: TParams[] = []
  private options: ExecutorOptions = DEFAULT_EXECUTOR_OPTIONS
  private walletAndConnection: WalletAndConnection
  private eventHandlers: Record<HandlerType, EventHandler> = DEFAULT_HANDLERS
  constructor(
    makeIxnFn: MakeActionFn<TParams, TResult>,
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

  public addTxnParam(param: TParams) {
    this.txnsParams = [...this.txnsParams, param]
    return this
  }

  public addTxnParams(params: TParams[]) {
    const paramsArr = params instanceof Array ? params : [params]
    this.txnsParams = [...this.txnsParams, ...paramsArr]
    return this
  }

  //TODO: Add normal types for handlers: success, error
  public on(type: HandlerType, handler: EventHandler) {
    this.eventHandlers[type] = handler
    return this
  }

  public async execute() {
    try {
      const { txnsParams, makeIxnsFn, walletAndConnection, options, eventHandlers } = this

      const txnsData = await Promise.all(
        txnsParams.map((params) => makeIxnsFn(params, { ...walletAndConnection })),
      )

      eventHandlers?.beforeFirstApprove()

      const txnChunks = chunk(txnsData, options.signAllChunks)

      const signAndSendTxnsResults: string[] = []
      for (const chunk of txnChunks) {
        try {
          const result = await signAndSendTxns({
            txnsData: chunk,
            walletAndConnection,
            eventHandlers,
            options,
          })
          result && signAndSendTxnsResults.push(...result)
        } catch (error) {
          eventHandlers?.pfError(error as TxnError)
          if (options.rejectQueueOnFirstPfError) return
        }
      }

      if (signAndSendTxnsResults.length === txnChunks.length) {
        eventHandlers?.pfSuccessAll()
      } else if (signAndSendTxnsResults.length) {
        eventHandlers?.pfSuccessAny()
      }

      return signAndSendTxnsResults
    } catch (error) {
      this.eventHandlers?.pfError(error as TxnError)
    }
  }
}
