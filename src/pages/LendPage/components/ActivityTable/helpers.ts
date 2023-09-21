import { RBOption } from '@banx/components/RadioButton'

export const appendIdToOptions = (options: RBOption[], id: string) => {
  return options.map((option) => {
    return {
      ...option,
      value: `${option.value}_${id}`,
    }
  })
}
