import { ui } from '../lib/store'
import { SECTION_IDS } from './shots'

export const HOTSPOT_LABELS = {
  projects: 'projects',
  research: 'my thesis',
  experience: 'work',
  writing: 'writing',
  about: 'about me',
  contact: 'say hi',
  radio: 'play the radio',
  guitar: 'strum',
  cat: 'pet the cat',
  catSill: 'pet the cat',
  clawd: 'say hi to clawd',
  lampDesk: 'the lamp',
  lampFloor: 'the lamp',
  lampTable: 'the lamp',
  lampShelf: 'the lamp',
  lampStrings: 'the string lights',
}

export function activate(id, action) {
  if (action) {
    action()
    return
  }
  const index = SECTION_IDS.indexOf(id)
  if (index >= 0) ui.set({ section: index })
}
