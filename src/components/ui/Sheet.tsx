import type { AppTheme } from '@/lib/theme'

interface SheetProps {
  C:        AppTheme
  onClose:  () => void
  title?:   string
  children: React.ReactNode
  maxH?:    string
}

export function Sheet({ C, onClose, title, children, maxH = '90dvh' }: SheetProps) {
  return (
    <div
      className="sheet-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="sheet-content scrollbar-none animate-scale-in"
        style={{ background: C.surface, border: `1px solid ${C.border}`, maxHeight: maxH }}
      >
        {/* Handle */}
        <div style={{ padding: '14px 20px 0', position: 'sticky', top: 0, background: C.surface, zIndex: 1 }}>
          <div style={{ width: 40, height: 4, borderRadius: 99, background: C.border, margin: '0 auto 16px' }} />
          {title && (
            <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 16 }}>{title}</div>
          )}
        </div>
        <div style={{ padding: '0 20px 4px' }}>{children}</div>
      </div>
    </div>
  )
}
