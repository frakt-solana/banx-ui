import { Button } from '@banx/components/Buttons'

import { Theme, useTheme } from '@banx/hooks'
import { Moon, Sun } from '@banx/icons'

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
