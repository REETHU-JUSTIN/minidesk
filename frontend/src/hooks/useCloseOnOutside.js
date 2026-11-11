import { useEffect } from 'react'

// Closes a dropdown when the user clicks outside it or presses Escape.
// This is a custom hook because two menus need exactly the same behavior.
export function useCloseOnOutside(containerRef, isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return

    function handleMouseDown(event) {
      const clickedInside = containerRef.current?.contains(event.target)
      if (!clickedInside) onClose()
    }

    function handleKeyDown(event) {
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
