import { createRoot } from 'react-dom/client'

import App from './App'
import * as serviceWorker from './serviceWorker'

import './less/index.less'

const container = document.getElementById('react')

if (container) {
  const root = createRoot(container)
  root.render(<App />)
}

serviceWorker.unregister()
