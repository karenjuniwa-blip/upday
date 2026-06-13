import { useRef, useState, useCallback } from 'react'
import type { AppTheme } from '@/lib/theme'
import type { PlannerEvent } from '@/types/database'
import { HOUR_HEIGHT, START_HOUR, END_HOUR } from '@/lib/theme'
import { minToPx, pxToMin, minToTime, snapMin, pad } from '@/utils'
import { usePlannerStore } from '@/stores/plannerStore'

interface TimelineProps {
  C:          AppTheme
  events:     PlannerEvent[]
  nowMin:     number
  isToday:    boolean
  onClickSlot: (startMin: number) => void
  onClickEvent: (ev: PlannerEvent) => void
}

export function PlannerTimeline({ C, events, nowMin, isToday, onClickSlot, onClickEvent }: TimelineProps) {
  const timelineRef                    = useRef<HTMLDivElement>(null)
  const { moveEvent, syncEvent }       = usePlannerStore()
  const [dragging, setDragging]        = useState<{ id: string; offsetY: number } | null>(null)
  const [resizing, setResizing]        = useState<string | null>(null)
  const isDirty                        = useRef(false)
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR)

  // ── helpers ─────────────────────────────────────────────────────────────────
  function getY(e: React.MouseEvent): number {
    if (!timelineRef.current) return 0
    const rect = timelineRef.current.getBoundingClientRect()
    return e.clientY - rect.top + timelineRef.current.scrollTop
  }

  // ── drag start ───────────────────────────────────────────────────────────────
  function onDragStart(e: React.MouseEvent, ev: PlannerEvent) {
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setDragging({ id: ev.id, offsetY: e.clientY - rect.top })
    isDirty.current = false
  }

  // ── resize start ─────────────────────────────────────────────────────────────
  function onResizeStart(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    setResizing(id)
    isDirty.current = false
  }

  // ── mouse move ───────────────────────────────────────────────────────────────
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging && !resizing) return
    const y = getY(e)

    if (dragging) {
      const ev = usePlannerStore.getState().events.find(x => x.id === dragging.id)
      if (!ev) return
      const dur      = ev.end_min - ev.start_min
      const rawStart = pxToMin(y - dragging.offsetY, HOUR_HEIGHT)
      const clamped  = Math.max(START_HOUR * 60, Math.min(END_HOUR * 60 - dur, rawStart))
      moveEvent(dragging.id, clamped, clamped + dur)
      isDirty.current = true
    }

    if (resizing) {
      const ev = usePlannerStore.getState().events.find(x => x.id === resizing)
      if (!ev) return
      const rawEnd = pxToMin(y, HOUR_HEIGHT)
      const newEnd = Math.max(ev.start_min + 15, Math.min(END_HOUR * 60, rawEnd))
      moveEvent(resizing, ev.start_min, newEnd)
      isDirty.current = true
    }
  }, [dragging, resizing, moveEvent])

  // ── mouse up ─────────────────────────────────────────────────────────────────
  const onMouseUp = useCallback(async () => {
    if (isDirty.current) {
      if (dragging) await syncEvent(dragging.id)
      if (resizing) await syncEvent(resizing)
    }
    setDragging(null)
    setResizing(null)
    isDirty.current = false
  }, [dragging, resizing, syncEvent])

  // ── click empty slot ─────────────────────────────────────────────────────────
  function onTimelineClick(e: React.MouseEvent) {
    if (isDirty.current || dragging || resizing) return
    const y      = getY(e)
    const minute = snapMin(pxToMin(y, HOUR_HEIGHT))
    onClickSlot(minute)
  }

  return (
    <div
      ref={timelineRef}
      style={{
        position: 'relative', overflowY: 'auto', overflowX: 'hidden',
        maxHeight: 'calc(100dvh - 270px)',
        cursor: dragging ? 'grabbing' : 'crosshair',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      className="scrollbar-none"
      onClick={onTimelineClick}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Hour rows */}
      {hours.map(h => (
        <div key={h} style={{ display: 'flex', gap: 8, height: HOUR_HEIGHT, position: 'relative' }}>
          <div style={{
            width: 40, flexShrink: 0, paddingTop: 4,
            fontSize: 11, color: C.muted, textAlign: 'right', lineHeight: 1,
          }}>
            {pad(h)}:00
          </div>
          <div style={{ flex: 1, borderTop: `1px solid ${C.border}33`, position: 'relative' }}>
            {/* 30-min dashed line */}
            <div style={{
              position: 'absolute', top: HOUR_HEIGHT / 2, left: 0, right: 0,
              borderTop: `1px dashed ${C.border}22`,
            }} />
          </div>
        </div>
      ))}

      {/* Events overlay */}
      <div style={{ position: 'absolute', top: 0, left: 48, right: 8 }}>
        {events.map(ev => {
          const top    = minToPx(ev.start_min, HOUR_HEIGHT)
          const height = Math.max(24, minToPx(ev.end_min, HOUR_HEIGHT) - minToPx(ev.start_min, HOUR_HEIGHT) - 2)
          const isDrag = dragging?.id === ev.id
          const isRes  = resizing === ev.id

          return (
            <div
              key={ev.id}
              onMouseDown={e => onDragStart(e, ev)}
              onClick={e => { e.stopPropagation(); if (!isDirty.current) onClickEvent(ev) }}
              style={{
                position: 'absolute', left: 2, right: 2,
                top, height,
                background: `${ev.color}26`,
                border: `1.5px solid ${ev.color}88`,
                borderLeft: `3px solid ${ev.color}`,
                borderRadius: 8, overflow: 'hidden',
                cursor: isDrag ? 'grabbing' : 'grab',
                boxShadow: isDrag ? `0 8px 24px ${ev.color}44` : 'none',
                transition: isDrag || isRes ? 'none' : 'top .08s, height .08s',
                zIndex: isDrag ? 20 : 10,
              }}
            >
              <div style={{ padding: '4px 8px' }}>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: ev.color,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {ev.title}
                </div>
                {height > 36 && (
                  <div style={{ fontSize: 10, color: C.muted }}>
                    {minToTime(ev.start_min)} – {minToTime(ev.end_min)}
                  </div>
                )}
              </div>

              {/* Resize handle */}
              <div
                onMouseDown={e => onResizeStart(e, ev.id)}
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: 10,
                  cursor: 'ns-resize',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <div style={{ width: 24, height: 3, borderRadius: 99, background: ev.color, opacity: .5 }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Now indicator */}
      {isToday && (
        <div style={{
          position: 'absolute', left: 48, right: 8,
          top: minToPx(nowMin, HOUR_HEIGHT),
          height: 2, background: C.rose, borderRadius: 2,
          zIndex: 30, pointerEvents: 'none',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: C.rose, marginTop: -3, marginLeft: -4,
            boxShadow: `0 0 8px ${C.rose}`,
          }} />
        </div>
      )}
    </div>
  )
}
