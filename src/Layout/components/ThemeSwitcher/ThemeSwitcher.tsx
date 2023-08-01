import { CircleButton } from '@frakt/components/Buttons'

import { Theme, useTheme } from '@frakt/hooks'
import { Moon, Sun } from '@frakt/icons'

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme()

  const Icon = theme === Theme.LIGHT ? Sun : Moon

  return (
    <CircleButton type="secondary" onClick={toggleTheme}>
      <Icon />
    </CircleButton>
  )
}

export default ThemeSwitcher
