import { ui } from '../lib/store'
import { SECTION_IDS } from './shots'

export const HOTSPOT_LABELS = {
  projects: 'Open projects',
  research: 'Read the research',
  experience: 'The moodboard',
  writing: 'Writing',
  about: 'Look outside',
  contact: 'Say hello',
  radio: 'Play the radio',
  guitar: 'Strum',
  cat: 'Pet the cat',
  catSill: 'Pet the cat',
  clawd: 'Say hi to Clawd',
}

export function activate(id, action) {
  if (action) {
    action()
    return
  }
  const index = SECTION_IDS.indexOf(id)
  if (index >= 0) ui.set({ section: index })
}
