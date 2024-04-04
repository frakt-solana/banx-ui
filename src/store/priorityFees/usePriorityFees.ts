import { z } from 'zod'
import { create } from 'zustand'

const BANX_PRIORITY_FEES_STATE_LS_KEY = '@banx.priorityFeesState'

export enum PriorityLevel {
  DEFAULT = 'Default',
  HIGH = 'High',
  VERY_HIGH = 'VeryHigh',
}

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
  // maxCap: DEFAULT_PRIORITY_FEE,
  // exactFee: DEFAULT_PRIORITY_FEE,
}))

export const usePriorityFees = () => {
  const { priorityLevel, setPriorityLevel: setPriorityLevelState } = usePriorityFeesState(
    (state) => {
      try {
        const priorityLevelJSON = localStorage.getItem(BANX_PRIORITY_FEES_STATE_LS_KEY)
        const priorityLevel = priorityLevelJSON
          ? (JSON.parse(priorityLevelJSON) as PriorityLevel)
          : PriorityLevel.VERY_HIGH

        //? Check LS data validity
        z.nativeEnum(PriorityLevel).parse(priorityLevel)

        return {
          ...state,
          priorityLevel,
        }
      } catch (error) {
        console.error('Error getting priority fee from LS. Set DEFAULT')
        localStorage.removeItem(BANX_PRIORITY_FEES_STATE_LS_KEY)
        return {
          ...state,
          priorityLevel: PriorityLevel.VERY_HIGH,
        }
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
