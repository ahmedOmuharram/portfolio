import { ui } from '../lib/store'
import { activate } from './hotspots'

export default function Hotspot({ id, action, children, ...props }) {
  return (
    <group
      {...props}
      onPointerOver={(e) => {
        e.stopPropagation()
        ui.set({ hovered: id })
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        if (ui.get().hovered === id) ui.set({ hovered: null })
        document.body.style.cursor = ''
      }}
      onClick={(e) => {
        e.stopPropagation()
        activate(id, action)
      }}
    >
      {children}
    </group>
  )
}
