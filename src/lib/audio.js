import { ui } from './store'

let ctx = null
let chordIndex = 0

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

const CHORDS = [
  [52, 59, 64, 67, 71, 74],
  [50, 57, 60, 65, 69, 72],
  [55, 59, 62, 66, 69, 74],
  [48, 55, 59, 64, 67, 71],
]

function pluck(ac, midi, when, gain) {
  const freq = 440 * Math.pow(2, (midi - 69) / 12)
  const sr = ac.sampleRate
  const period = Math.round(sr / freq)
  const length = Math.round(sr * 2.6)
  const buffer = ac.createBuffer(1, length, sr)
  const data = buffer.getChannelData(0)
  const ring = new Float32Array(period)
  for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1
  let prev = 0
  for (let i = 0; i < period; i++) {
    prev = prev * 0.6 + ring[i] * 0.4
    ring[i] = prev
  }
  const decay = 0.996
  for (let i = 0; i < length; i++) {
    const idx = i % period
    const next = (idx + 1) % period
    const v = ring[idx]
    ring[idx] = (v + ring[next]) * 0.5 * decay
    data[i] = v
  }
  const src = ac.createBufferSource()
  src.buffer = buffer
  const g = ac.createGain()
  g.gain.setValueAtTime(gain, when)
  g.gain.exponentialRampToValueAtTime(0.0001, when + 2.5)
  const tone = ac.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = 3200
  src.connect(tone).connect(g).connect(ac.destination)
  src.start(when)
}

export function strum() {
  ui.set((s) => ({ strum: s.strum + 1 }))
  const ac = audio()
  if (!ac) return
  const chord = CHORDS[chordIndex % CHORDS.length]
  chordIndex += 1
  const now = ac.currentTime + 0.02
  chord.forEach((n, i) => pluck(ac, n, now + i * 0.028, 0.16))
}

export function purr() {
  ui.set((s) => ({ purr: s.purr + 1 }))
  const ac = audio()
  if (!ac) return
  const duration = 2.4
  const len = Math.round(ac.sampleRate * duration)
  const buffer = ac.createBuffer(1, len, ac.sampleRate)
  const data = buffer.getChannelData(0)
  let brown = 0
  for (let i = 0; i < len; i++) {
    brown = (brown + (Math.random() * 2 - 1) * 0.02) / 1.02
    const t = i / ac.sampleRate
    const pulse = 0.55 + 0.45 * Math.sin(t * Math.PI * 2 * 24)
    const breath = Math.sin(Math.PI * Math.min(1, t / duration))
    data[i] = brown * 3.2 * pulse * breath
  }
  const src = ac.createBufferSource()
  src.buffer = buffer
  const lp = ac.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 180
  const g = ac.createGain()
  g.gain.value = 0.9
  src.connect(lp).connect(g).connect(ac.destination)
  src.start()
}
