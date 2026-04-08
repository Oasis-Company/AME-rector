import TopMenuBar from './components/TopMenuBar/TopMenuBar.tsx'
import Workbench from './components/Workbench/Workbench.tsx'
import RectorPanel from './components/RectorPanel/RectorPanel.tsx'
import { useState } from 'react'
import './App.css'

function App() {
  const [panels, setPanels] = useState<React.ReactNode[]>([
    <RectorPanel key="rector-0" />,
  ])

  function handleAddComponent(name: string) {
    if (name === 'Rector') {
      setPanels(prev => [...prev, <RectorPanel key={`rector-${prev.length}`} />])
    }
  }

  return (
    <div className="app-layout">
      <TopMenuBar onAddComponent={handleAddComponent} />
      <Workbench panels={panels} onAddComponent={handleAddComponent} />
    </div>
  )
}

export default App
