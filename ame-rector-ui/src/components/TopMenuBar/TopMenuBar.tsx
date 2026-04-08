import { useState, useEffect, useRef } from 'react'
import './TopMenuBar.css'

const MENUS = [
  { label: 'File', items: ['New Session', 'Open Media…', 'Save Layout', 'Export'] },
  { label: 'Tool', items: ['Settings', 'Diagnostics', 'Reset Workbench'] },
]

interface TopMenuBarProps {
  onAddComponent: (name: string) => void
}

export default function TopMenuBar({ onAddComponent }: TopMenuBarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  function toggleMenu(label: string) {
    setPickerOpen(false)
    setOpenMenu(prev => (prev === label ? null : label))
  }

  return (
    <header className="top-bar" ref={barRef}>

      {/* Left: File / Tool */}
      <nav className="top-bar__left" aria-label="Main menu">
        {MENUS.map(menu => (
          <div className="top-bar__item" key={menu.label}>
            <button
              className="top-bar__btn"
              onClick={() => toggleMenu(menu.label)}
              aria-haspopup="true"
              aria-expanded={openMenu === menu.label}
            >
              {menu.label}
            </button>
            {openMenu === menu.label && (
              <ul className="top-bar__dropdown" role="menu">
                {menu.items.map(item => (
                  <li key={item} role="menuitem">
                    <button className="top-bar__dropdown-item">{item}</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        <div className="top-bar__sep" />
      </nav>

      {/* Right: + add component */}
      <div className="top-bar__right">
        <div className="top-bar__item">
          <button
            className="top-bar__add-btn"
            onClick={() => { setOpenMenu(null); setPickerOpen(p => !p) }}
            aria-haspopup="true"
            aria-expanded={pickerOpen}
            title="Add component"
          >
            +
          </button>
          {pickerOpen && (
            <ul className="top-bar__dropdown top-bar__dropdown--right" role="menu">
              <li role="menuitem">
                <button
                  className="top-bar__dropdown-item"
                  onClick={() => { setPickerOpen(false); onAddComponent('Rector') }}
                >
                  Rector
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>

    </header>
  )
}
