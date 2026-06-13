import { useState, useEffect } from 'react'

interface WindowSize {
  width:  number
  height: number
  isXs:   boolean   // < 360
  isSm:   boolean   // 360–389
  isMd:   boolean   // 390–429
  isLg:   boolean   // ≥ 430
}

export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>(getSize)

  useEffect(() => {
    const handler = () => setSize(getSize())
    window.addEventListener('resize', handler, { passive: true })
    return () => window.removeEventListener('resize', handler)
  }, [])

  return size
}

function getSize(): WindowSize {
  const w = window.innerWidth
  const h = window.innerHeight
  return {
    width:  w,
    height: h,
    isXs:   w < 360,
    isSm:   w >= 360 && w < 390,
    isMd:   w >= 390 && w < 430,
    isLg:   w >= 430,
  }
}
