import { useEffect } from 'react'
import type { RefObject } from 'react'

// Closes a dropdown when the user clicks outside it or presses Escape.
// This is a custom hook because two menus need exactly the same behavior.
export function useCloseOnOutside(containerRef: RefObject<HTMLElement | null>, isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return

    function handleMouseDown(event: MouseEvent) {
      const clickedInside = containerRef.current?.contains(event.target as Node)
      if (!clickedInside) onClose()
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [containerRef, isOpen, onClose])
}
