import { Button } from '@frakt/components/Buttons'

import { Theme, useTheme } from '@frakt/hooks'
import { Moon, Sun } from '@frakt/icons'

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme()

  const Icon = theme === Theme.LIGHT ? Sun : Moon

  return (
    <Button type="circle" variant="secondary" onClick={toggleTheme}>
      <Icon />
    </Button>
  )
}

export default ThemeSwitcher
