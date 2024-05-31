import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  BondOfferOptimistic,
  createPerpetualBondOfferBonding,
  getBondingCurveTypeFromLendingToken,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondFeatures, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import { calculateNewOfferSize, isBanxSolTokenType, removeDuplicatedPublicKeys } from '@banx/utils'

import { sendTxnPlaceHolder } from '../../helpers'

type CreateMakeBondingOfferTxnDataParams = {
  marketPubkey: string
  loanValue: number //? normal number
  loansAmount: number
  deltaValue: number //? normal number
  tokenType: LendingTokenType
  walletAndConnection: WalletAndConnection
}

type CreateMakeBondingOfferTxnData = (
  params: CreateMakeBondingOfferTxnDataParams,
) => Promise<CreateTxnData<BondOfferOptimistic>>

export const createMakeBondingOfferTxnData: CreateMakeBondingOfferTxnData = async ({
  marketPubkey,
  loanValue,
  loansAmount,
  tokenType,
  deltaValue,
  walletAndConnection,
}) => {
  const bondingCurveType = getBondingCurveTypeFromLendingToken(tokenType)

  const { instructions, signers, optimisticResult } = await createPerpetualBondOfferBonding({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    connection: walletAndConnection.connection,
    accounts: {
      hadoMarket: new web3.PublicKey(marketPubkey),
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    args: {
      loanValue: loanValue,
      delta: deltaValue,
      quantityOfLoans: loansAmount,
      bondingCurveType,
      bondFeature: BondFeatures.AutoReceiveAndReceiveNft,
      collateralsPerToken: 0,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  const lookupTables = [new web3.PublicKey(LOOKUP_TABLE)]

  if (isBanxSolTokenType(tokenType)) {
    return await wrapWithBanxSolSwapInstructions({
      marketPubkey,
      loanValue,
      loansAmount,
      tokenType,
      deltaValue,
      walletAndConnection,
      instructions,
      signers,
      lookupTables,
      result: optimisticResult,
    })
  }

  return {
    instructions,
    signers,
    result: optimisticResult,
    lookupTables,
  }
}

const wrapWithBanxSolSwapInstructions = async ({
  loanValue,
  loansAmount,
  deltaValue,
  instructions,
  lookupTables,
  result,
  signers,
  walletAndConnection,
}: CreateTxnData<BondOfferOptimistic> & CreateMakeBondingOfferTxnDataParams): Promise<
  CreateTxnData<BondOfferOptimistic>
> => {
  const offerSize = calculateNewOfferSize({ loanValue, loansAmount, deltaValue })

  const { instructions: swapInstructions, lookupTable: swapLookupTable } =
    await banxSol.getSwapSolToBanxSolInstructions({
      inputAmount: new BN(offerSize),
      walletAndConnection,
    })

  const { instructions: closeInstructions, lookupTable: closeLookupTable } =
    await banxSol.getCloseBanxSolATAsInstructions({
      walletAndConnection,
    })

  return {
    instructions: [...swapInstructions, ...instructions, ...closeInstructions],
    signers,
    result,
    lookupTables: removeDuplicatedPublicKeys([
      swapLookupTable,
      ...(lookupTables ?? []),
      closeLookupTable,
    ]),
  }
}
