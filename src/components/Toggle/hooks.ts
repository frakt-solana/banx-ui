import { useState } from 'react'

export const useToggle = (initialValue: boolean) => {
  const [checked, setChecked] = useState(initialValue)

  const handleToggleChange = () => {
    setChecked(!checked)
  }

  return { checked, onToggleChange: handleToggleChange }
}
