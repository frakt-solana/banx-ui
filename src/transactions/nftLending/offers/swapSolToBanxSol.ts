import { BN, web3 } from '@project-serum/anchor'
import { TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token'
import { createSyncNativeInstruction } from '@solana/spl-token'
import {
  createAssociatedTokenAccountInstruction,
  createAssociatedTokenAccountInstructionIdimpotent,
  findAssociatedTokenAddress,
} from 'fbonds-core/lib/common'
import { SwapExactInInstructionDataLayout } from 'fbonds-core/lib/fbond-protocol/bufferLayouts'
import {
  BANX_SOL_MINT,
  BANX_SOL_POOL_RESERVE,
  LST_STATE_BANX_SOL,
  LST_STATE_LIST,
  MANAGER_BANX_SOL_FEE_TOKEN_ACCOUNT_IN,
  MANAGER_BANX_SOL_FEE_TOKEN_ACCOUNT_OUT,
  SANCTUM_BANX_SOL_FEE_ACCOUNT,
  SANCTUM_FLAT_FEE_PRICING,
  SANCTUM_POOL_PROGRAM,
  SANCTUM_POOL_PROGRAM_DATA,
  SANCTUM_POOL_STATE,
  SANCTUM_POOL_STATE_BANX_SOL,
  SANCTUM_SPL_MULTI_CALCULATOR,
  SANCTUM_WSOL_CALCULATOR,
  SANCTUM_WSOL_FEE_ACCOUNT,
  WRAPPED_SOL_MINT,
  W_SOL_POOL_RESERVE,
} from 'fbonds-core/lib/fbond-protocol/constants'
import { returnAnchorProgramSanctum } from 'fbonds-core/lib/fbond-protocol/helpers'

export enum SwapMode {
  BanxSolToSol = 'banxSolToSol',
  SolToBanxSol = 'solToBanxSol',
}

type ChangeBanxAdventureRevAdmin = (params: {
  programId: web3.PublicKey
  connection: web3.Connection

  args: {
    min_amount_out: BN
    amount: BN
    swapMode: SwapMode
    banxSolLstIndex: number
    wSolLstIndex: number
  }

  accounts: {
    userPubkey: web3.PublicKey
  }

  sendTxn: (transaction: web3.Transaction, signers: web3.Signer[]) => Promise<void>
}) => Promise<{
  instructions: web3.TransactionInstruction[]
  signers: web3.Signer[]
}>

export const swapSolToBanxSol: ChangeBanxAdventureRevAdmin = async ({
  programId,
  connection,
  accounts,
  args,
  sendTxn,
}) => {
  const instructions: web3.TransactionInstruction[] = []
  const program = returnAnchorProgramSanctum(programId, connection)
  const userBanxSolTokenAccount = await findAssociatedTokenAddress(
    accounts.userPubkey,
    BANX_SOL_MINT,
  )
  const userWSolTokenAccount = await findAssociatedTokenAddress(
    accounts.userPubkey,
    WRAPPED_SOL_MINT,
  )
  const {
    discriminator,
    srcLstIndex,
    dstLstIndex,
    srcLstAcc,
    dstLstAcc,
    srcLstMint,
    dstLstMint,
    srcLstReserves,
    dstLstReserves,
    srcFeeAcc,
    dstFeeAcc,
    protocolFeeAccumulator,
    srcLstValueCalcAccs,
    dstLstValueCalcAccs,
  } =
    args.swapMode === SwapMode.SolToBanxSol
      ? {
          discriminator: 1,
          srcLstIndex: args.wSolLstIndex,
          dstLstIndex: args.banxSolLstIndex,
          srcLstAcc: userWSolTokenAccount,
          dstLstAcc: userBanxSolTokenAccount,
          srcLstMint: WRAPPED_SOL_MINT,
          dstLstMint: BANX_SOL_MINT,
          srcLstReserves: W_SOL_POOL_RESERVE,
          dstLstReserves: BANX_SOL_POOL_RESERVE,
          srcFeeAcc: SANCTUM_WSOL_FEE_ACCOUNT,
          dstFeeAcc: SANCTUM_BANX_SOL_FEE_ACCOUNT,
          protocolFeeAccumulator: MANAGER_BANX_SOL_FEE_TOKEN_ACCOUNT_IN,
          srcLstValueCalcAccs: 1,
          dstLstValueCalcAccs: 5,
        }
      : {
          discriminator: 2,
          srcLstIndex: args.banxSolLstIndex,
          dstLstIndex: args.wSolLstIndex,
          srcLstAcc: userBanxSolTokenAccount,
          dstLstAcc: userWSolTokenAccount,
          srcLstMint: BANX_SOL_MINT,
          dstLstMint: WRAPPED_SOL_MINT,
          srcLstReserves: BANX_SOL_POOL_RESERVE,
          dstLstReserves: W_SOL_POOL_RESERVE,
          srcFeeAcc: SANCTUM_BANX_SOL_FEE_ACCOUNT,
          dstFeeAcc: SANCTUM_WSOL_FEE_ACCOUNT,
          protocolFeeAccumulator: MANAGER_BANX_SOL_FEE_TOKEN_ACCOUNT_OUT,
          srcLstValueCalcAccs: 5,
          dstLstValueCalcAccs: 1,
        }
  const remainingAccountsWSOL = [
    {
      pubkey: SANCTUM_WSOL_CALCULATOR,
      isSigner: false,
      isWritable: true,
    },
  ]
  const remainingAccountsBanxSOL = [
    {
      pubkey: SANCTUM_SPL_MULTI_CALCULATOR,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: LST_STATE_BANX_SOL,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SANCTUM_POOL_STATE_BANX_SOL,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SANCTUM_POOL_PROGRAM,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SANCTUM_POOL_PROGRAM_DATA,
      isSigner: false,
      isWritable: false,
    },
  ]
  const remainingAccountsFlatFee = [
    {
      pubkey: SANCTUM_FLAT_FEE_PRICING,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: srcFeeAcc,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: dstFeeAcc,
      isSigner: false,
      isWritable: false,
    },
  ]
  if (args.swapMode === SwapMode.SolToBanxSol) {
    instructions.push(
      ...createAssociatedTokenAccountInstruction(
        userBanxSolTokenAccount,
        accounts.userPubkey,
        accounts.userPubkey,
        BANX_SOL_MINT,
      ),
    )

    instructions.push(
      ...createAssociatedTokenAccountInstructionIdimpotent(
        userWSolTokenAccount,
        accounts.userPubkey,
        accounts.userPubkey,
        WRAPPED_SOL_MINT,
      ),
    )
    instructions.push(
      web3.SystemProgram.transfer({
        fromPubkey: accounts.userPubkey,
        toPubkey: userWSolTokenAccount,
        lamports: Number(args.amount),
      }),
    )
    instructions.push(createSyncNativeInstruction(userWSolTokenAccount))
  }

  const remainingAccounts = [
    ...remainingAccountsWSOL,
    ...remainingAccountsBanxSOL,
    ...remainingAccountsFlatFee,
  ]
  const inst = await program.methods
    .swapExactIn(0, 0, 0, 0, 0, new BN(args.min_amount_out), new BN(args.amount))
    .accountsStrict({
      signer: accounts.userPubkey,
      src_lst_mint: srcLstMint,
      dst_lst_mint: dstLstMint,
      src_lst_acc: srcLstAcc,
      dst_lst_acc: dstLstAcc,
      protocol_fee_accumulator: protocolFeeAccumulator,
      src_lst_token_program: TOKEN_PROGRAM_ID,
      dst_lst_token_program: TOKEN_PROGRAM_ID,
      pool_state: SANCTUM_POOL_STATE,
      lst_state_list: LST_STATE_LIST,
      src_pool_reserves: srcLstReserves,
      dst_pool_reserves: dstLstReserves,
    })
    .remainingAccounts(remainingAccounts)
    .instruction()

  SwapExactInInstructionDataLayout.encode(
    {
      discriminator,
      srcLstValueCalcAccs: srcLstValueCalcAccs,
      dstLstValueCalcAccs: dstLstValueCalcAccs,
      srcLstIndex,
      dstLstIndex,
      minAmountOut: BigInt(Number(args.min_amount_out)),
      amount: BigInt(Number(args.amount)),
    },
    inst.data,
  )

  instructions.push(inst)

  const transaction = new web3.Transaction()
  for (const instruction of instructions) transaction.add(instruction)

  const signers: web3.Signer[] = []
  await sendTxn(transaction, signers)

  return {
    instructions,
    signers,
  }
}
