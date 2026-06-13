import { useRef, useState, useCallback } from 'react'
import { usePlannerStore } from '@/stores/plannerStore'
import { pxToMin, minToPx, snapMin } from '@/utils'
import { HOUR_HEIGHT, START_HOUR } from '@/lib/theme'

interface DragState { id: string; offsetY: number }
interface ResizeState { id: string }

export function usePlannerDrag(timelineRef: React.RefObject<HTMLDivElement>) {
  const { moveEvent, syncEvent } = usePlannerStore()
  const [dragging, setDragging] = useState<DragState | null>(null)
  const [resizing, setResizing] = useState<ResizeState | null>(null)
  const isDirty = useRef(false)

  // ── Start drag ─────────────────────────────────────────────────────────────
  const startDrag = useCallback((e: React.MouseEvent, eventId: string) => {
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const offsetY = e.clientY - rect.top
    setDragging({ id: eventId, offsetY })
    isDirty.current = false
  }, [])

  // ── Start resize ───────────────────────────────────────────────────────────
  const startResize = useCallback((e: React.MouseEvent, eventId: string) => {
    e.stopPropagation()
    setResizing({ id: eventId })
    isDirty.current = false
  }, [])

  // ── Mouse move ─────────────────────────────────────────────────────────────
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!timelineRef.current) return
    if (!dragging && !resizing) return

    const rect   = timelineRef.current.getBoundingClientRect()
    const scrollY = timelineRef.current.scrollTop
    const y = e.clientY - rect.top + scrollY

    if (dragging) {
      const rawStart = pxToMin(y - dragging.offsetY, HOUR_HEIGHT)
      const events   = usePlannerStore.getState().events
      const ev       = events.find(e => e.id === dragging.id)
      if (!ev) return
      const dur      = ev.end_min - ev.start_min
      const newStart = Math.max(START_HOUR * 60, Math.min(22 * 60 - dur, rawStart))
      moveEvent(dragging.id, newStart, newStart + dur)
      isDirty.current = true
    }

    if (resizing) {
      const rawEnd = pxToMin(y, HOUR_HEIGHT)
      const events = usePlannerStore.getState().events
      const ev     = events.find(e => e.id === resizing.id)
      if (!ev) return
      const newEnd = Math.max(ev.start_min + 15, rawEnd)
      moveEvent(resizing.id, ev.start_min, newEnd)
      isDirty.current = true
    }
  }, [dragging, resizing, moveEvent])

  // ── Mouse up ───────────────────────────────────────────────────────────────
  const onMouseUp = useCallback(async () => {
    if (isDirty.current) {
      if (dragging)  await syncEvent(dragging.id)
      if (resizing)  await syncEvent(resizing.id)
    }
    setDragging(null)
    setResizing(null)
    isDirty.current = false
  }, [dragging, resizing, syncEvent])

  // ── Timeline click → new event ─────────────────────────────────────────────
  const getClickMinute = useCallback((e: React.MouseEvent): number | null => {
    if (dragging || resizing || isDirty.current) return null
    if (!timelineRef.current) return null
    const rect   = timelineRef.current.getBoundingClientRect()
    const scrollY = timelineRef.current.scrollTop
    const y = e.clientY - rect.top + scrollY
    return snapMin(pxToMin(y, HOUR_HEIGHT))
  }, [dragging, resizing])

  return { dragging, resizing, startDrag, startResize, onMouseMove, onMouseUp, getClickMinute }
}
