import { useState, useCallback, DragEvent } from 'react'
import './RectorPanel.css'

// ─── Types ───────────────────────────────────────────────────────────────

type Stage = 'idle' | 'input_ready' | 'configured' | 'processing' | 'done' | 'error'

interface FileInfo {
  name: string
  type: 'image' | 'video'
  size: number
}

interface Config {
  modelPath: string
  detectType: 'all' | 'arch' | 'object'
}

// ─── Constants ────────────────────────────────────────────────────────────

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']

const DEFAULT_CONFIG: Config = {
  modelPath: 'manycore-research/SpatialLM1.1-Llama-1B',
  detectType: 'all',
}

const PROCESS_STAGES = ['SAM3 — segmenting objects', 'SpatialLM — predicting layout']

const STATE_LABELS: Record<Stage, string> = {
  idle: 'Idle',
  input_ready: 'Input Ready',
  configured: 'Configured',
  processing: 'Processing',
  done: 'Done',
  error: 'Error',
}

// ─── Helper components ────────────────────────────────────────────────────

function FileIcon() {
  return (
    <svg className="file-preview__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

// ─── DropZone ─────────────────────────────────────────────────────────────

interface DropZoneProps {
  onFile: (f: FileInfo) => void
}

function DropZone({ onFile }: DropZoneProps) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  function validate(file: File) {
    if (!ACCEPTED.includes(file.type)) {
      setError(`Unsupported format. Accepted: jpg, png, webp, mp4, mov`)
      return false
    }
    setError('')
    return true
  }

  function accept(file: File) {
    if (!validate(file)) return
    onFile({
      name: file.name,
      type: file.type.startsWith('image') ? 'image' : 'video',
      size: file.size,
    })
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) accept(file)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) accept(file)
  }

  return (
    <div
      className={`dropzone${dragging ? ' dropzone--dragover' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <svg className="dropzone__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17,8 12,3 7,8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <p className="dropzone__label">Drop image or video here</p>
      <p className="dropzone__hint">or click to browse — jpg, png, webp, mp4, mov</p>
      <input
        type="file"
        accept={ACCEPTED.join(',')}
        onChange={onInputChange}
        style={{ display: 'none' }}
        id="rector-file-input"
      />
      {error && (
        <p style={{ color: '#c00', fontSize: 'var(--fs-xs)', marginTop: 4 }}>{error}</p>
      )}
    </div>
  )
}

// ─── ConfigSection ────────────────────────────────────────────────────────

interface ConfigSectionProps {
  config: Config
  onChange: (c: Config) => void
  onRun: () => void
}

function ConfigSection({ config, onChange, onRun }: ConfigSectionProps) {
  const canRun = config.modelPath.trim().length > 0

  return (
    <div className="config">
      {/* Model Path */}
      <div className="config__row">
        <label className="config__label">Model Path</label>
        <input
          className="config__input"
          type="text"
          value={config.modelPath}
          onChange={e => onChange({ ...config, modelPath: e.target.value })}
          placeholder="manycore-research/SpatialLM1.1-Llama-1B"
        />
        <span className="config__desc">HuggingFace model identifier or local path</span>
      </div>

      {/* Detect Type */}
      <div className="config__row">
        <label className="config__label">Detect Type</label>
        <select
          className="config__select"
          value={config.detectType}
          onChange={e => onChange({ ...config, detectType: e.target.value as Config['detectType'] })}
        >
          <option value="all">All — walls, doors, windows, objects</option>
          <option value="arch">Architecture — walls, doors, windows</option>
          <option value="object">Objects — furniture and items only</option>
        </select>
        <span className="config__desc">Which element types to detect in the scene</span>
      </div>
    </div>
  )
}

// ─── Main RectorPanel ─────────────────────────────────────────────────────

export default function RectorPanel() {
  const [stage, setStage] = useState<Stage>('idle')
  const [file, setFile] = useState<FileInfo | null>(null)
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
  const [progress, setProgress] = useState(0)
  const [currentProcessStep, setCurrentProcessStep] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  const handleFile = useCallback((f: FileInfo) => {
    setFile(f)
    setStage('configured')
  }, [])

  const handleRun = useCallback(() => {
    if (stage !== 'configured') return
    setStage('processing')
    setProgress(0)
    setCurrentProcessStep(0)

    // Simulate SAM3 stage → SpatialLM stage → done
    let p = 0
    const interval = setInterval(() => {
      p += 2
      setProgress(p)
      if (p >= 50 && currentProcessStep === 0) {
        setCurrentProcessStep(1)
      }
      if (p >= 100) {
        clearInterval(interval)
        setStage('done')
      }
    }, 60)
  }, [stage, currentProcessStep])

  const handleRetry = useCallback(() => {
    setStage('configured')
    setErrorMsg('')
    setProgress(0)
    setCurrentProcessStep(0)
  }, [])

  const dotColor =
    stage === 'idle' ? 'var(--dot-idle)' :
    stage === 'input_ready' || stage === 'configured' ? 'var(--dot-ready)' :
    stage === 'processing' ? 'var(--dot-processing)' :
    stage === 'done' ? 'var(--dot-done)' : 'var(--dot-error)'

  return (
    <div className="rector">

      {/* Header */}
      <div className="rector__header">
        <span className="rector__name">Rector</span>
        <span className="rector__dot" style={{ background: dotColor }} />
        <span className="rector__status">{STATE_LABELS[stage]}</span>
      </div>

      {/* Body */}
      <div className="rector__body">

        {/* ── Idle: Drop Zone ── */}
        {stage === 'idle' && (
          <DropZone onFile={handleFile} />
        )}

        {/* ── Input Ready / Configured: File Preview + Config ── */}
        {(stage === 'input_ready' || stage === 'configured') && (
          <>
            {/* File preview */}
            {file && (
              <div className="file-preview">
                <FileIcon />
                <span className="file-preview__name">{file.name}</span>
                <span className="file-preview__type">{file.type}</span>
                <button
                  className="file-preview__clear"
                  onClick={() => { setFile(null); setStage('idle') }}
                  title="Remove file"
                >
                  <XIcon />
                </button>
              </div>
            )}

            <ConfigSection
              config={config}
              onChange={setConfig}
              onRun={handleRun}
            />

            <div className="rector__actions">
              <button
                className={`btn btn--primary`}
                onClick={handleRun}
                disabled={config.modelPath.trim().length === 0}
              >
                RUN RECTOR
              </button>
            </div>
          </>
        )}

        {/* ── Processing ── */}
        {stage === 'processing' && (
          <div className="state-view">
            <div className="state-view__dot state-view__dot--pulse" />
            <p className="state-view__stage">{PROCESS_STAGES[currentProcessStep]}</p>
            <div className="state-view__progress">
              <div className="state-view__progress-bar" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* ── Done ── */}
        {stage === 'done' && (
          <div className="state-view">
            <div className="state-view__dot" style={{ background: 'var(--dot-done)' }} />
            <p className="state-view__done-msg">Result written to Information Pool.</p>
            <button
              className="btn"
              onClick={() => setStage('idle')}
              style={{ marginTop: 'var(--sp-2)' }}
            >
              New Run
            </button>
          </div>
        )}

        {/* ── Error ── */}
        {stage === 'error' && (
          <div className="state-view">
            <div className="state-view__dot" style={{ background: 'var(--dot-error)' }} />
            <div className="state-view__error-msg">{errorMsg}</div>
            <button className="btn" onClick={handleRetry}>Retry</button>
          </div>
        )}

      </div>
    </div>
  )
}
