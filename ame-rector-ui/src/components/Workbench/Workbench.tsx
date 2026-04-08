import './Workbench.css'

interface WorkbenchProps {
  panels: React.ReactNode[]
  onAddComponent: (name: string) => void
}

export default function Workbench({ panels }: WorkbenchProps) {
  if (panels.length === 0) {
    return (
      <div className="workbench">
        <div className="workbench__empty">
          <p className="workbench__empty-sub">Workbench</p>
          <p className="workbench__empty-msg">No components — use + in the top bar to add one.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="workbench">
      <div className="workbench__panels">
        {panels.map((panel, i) => (
          <div className="workbench__slot" key={i}>
            {panel}
          </div>
        ))}
      </div>
    </div>
  )
}
