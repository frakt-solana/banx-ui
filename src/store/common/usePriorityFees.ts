import { z } from 'zod'
import { create } from 'zustand'

const BANX_PRIORITY_FEES_STATE_LS_KEY = '@banx.priorityFeesState'

export const DEFAULT_PRIORITY_FEE = 300_000 //? Micro lamports

export enum PriorityLevel {
  DEFAULT = 'Default',
  HIGH = 'High',
  VERY_HIGH = 'VeryHigh',
}

const DEFAULT_PRIORITY_FEE_LEVEL = PriorityLevel.HIGH

const HUMAN_PRIORITY_LEVEL: Record<PriorityLevel, string> = {
  [PriorityLevel.DEFAULT]: 'Fast',
  [PriorityLevel.HIGH]: 'Turbo',
  [PriorityLevel.VERY_HIGH]: 'Ultra',
}

export const getHumanReadablePriorityLevel = (priorityLevel: PriorityLevel) => {
  return HUMAN_PRIORITY_LEVEL[priorityLevel]
}

type PriorityFeesState = {
  priorityLevel: PriorityLevel
  setPriorityLevel: (priorityLevel: PriorityLevel) => void
}

export const usePriorityFeesState = create<PriorityFeesState>((set) => ({
  priorityLevel: PriorityLevel.DEFAULT,
  setPriorityLevel: (priorityLevel: PriorityLevel) => set((state) => ({ ...state, priorityLevel })),
}))

export const usePriorityFees = () => {
  const { priorityLevel, setPriorityLevel: setPriorityLevelState } = usePriorityFeesState(
    (state) => {
      const priorityLevel = getPriorityFeeLevel()

      return {
        ...state,
        priorityLevel,
      }
    },
  )

  const setPriorityLevel = (priorityLevel: PriorityLevel) => {
    try {
      setPriorityLevelState(priorityLevel)
      localStorage.setItem(BANX_PRIORITY_FEES_STATE_LS_KEY, JSON.stringify(priorityLevel))
    } catch (error) {
      console.error(error)
    }
  }

  return { priorityLevel, setPriorityLevel }
}

export const getPriorityFeeLevel = () => {
  try {
    const priorityLevelJSON = localStorage.getItem(BANX_PRIORITY_FEES_STATE_LS_KEY)

    //? If fee level isn't saved in LS --> return default
    if (!priorityLevelJSON) {
      return DEFAULT_PRIORITY_FEE_LEVEL
    }

    const priorityLevel: PriorityLevel = JSON.parse(priorityLevelJSON)

    //? Check LS data validity
    z.nativeEnum(PriorityLevel).parse(priorityLevel)

    return priorityLevel
  } catch (error) {
    console.error('Invalid priorityFee value in LS. Value was removed')
    localStorage.removeItem(BANX_PRIORITY_FEES_STATE_LS_KEY)
    return DEFAULT_PRIORITY_FEE_LEVEL
  }
}
