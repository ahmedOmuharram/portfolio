import { ui } from './store'

let ctx = null
let bus = null
let chordIndex = 0

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -14
    limiter.knee.value = 8
    limiter.ratio.value = 6
    limiter.attack.value = 0.004
    limiter.release.value = 0.2
    bus = ctx.createGain()
    bus.gain.value = 0.9
    bus.connect(limiter).connect(ctx.destination)
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
  for (let i = 0; i < length; i++) {
    const idx = i % period
    const v = ring[idx]
    ring[idx] = (v + ring[(idx + 1) % period]) * 0.5 * 0.996
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
  src.connect(tone).connect(g).connect(bus)
  src.start(when)
}

let lastStrum = 0

export function strum() {
  const now = performance.now()
  if (now - lastStrum < 160) return
  lastStrum = now
  ui.set((s) => ({ strum: s.strum + 1 }))
  const ac = audio()
  if (!ac) return
  const chord = CHORDS[chordIndex % CHORDS.length]
  chordIndex += 1
  const t = ac.currentTime + 0.02
  chord.forEach((n, i) => pluck(ac, n, t + i * 0.028, 0.16))
}

let purrBuffer = null

function makePurr(ac) {
  const sr = ac.sampleRate
  const cycle = 2.4
  const len = Math.round(sr * cycle * 2)
  const buffer = ac.createBuffer(1, len, sr)
  const data = buffer.getChannelData(0)
  let noise = 0
  let phase = 0
  for (let i = 0; i < len; i++) {
    const t = i / sr
    const c = (t % cycle) / cycle
    const exhale = c < 0.56
    const local = exhale ? c / 0.56 : (c - 0.56) / 0.44
    const env = Math.sin(Math.PI * local) ** 0.7 * (exhale ? 1 : 0.62)
    const rate = exhale ? 26 : 22.5
    phase += rate / sr
    const pulse = Math.max(0, Math.sin(2 * Math.PI * phase)) ** 2.4
    noise = noise * 0.86 + (Math.random() * 2 - 1) * 0.14
    const body = Math.sin(2 * Math.PI * phase * 2) * 0.35
    data[i] = (noise * 2.6 + body * 0.5) * pulse * env
  }
  return buffer
}

const VOICES = {
  sill: { pitch: 640, purrRate: 1.06, size: 1 },
  cat: { pitch: 470, purrRate: 0.94, size: 1.15 },
  floor: { pitch: 560, purrRate: 1.0, size: 1.08 },
}

const cats = {}

function catState(id) {
  if (!cats[id]) cats[id] = { pets: [], annoyedUntil: 0, lastMeow: 0, purr: null, purrUntil: 0, timer: null }
  return cats[id]
}

function startPurr(ac, id, seconds) {
  const st = catState(id)
  const voice = VOICES[id] || VOICES.sill
  if (!purrBuffer) purrBuffer = makePurr(ac)
  const now = ac.currentTime
  if (!st.purr) {
    const src = ac.createBufferSource()
    src.buffer = purrBuffer
    src.loop = true
    src.playbackRate.value = voice.purrRate
    const lp = ac.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 340
    const g = ac.createGain()
    g.gain.setValueAtTime(0, now)
    src.connect(lp).connect(g).connect(bus)
    src.start(now, Math.random() * 2)
    st.purr = { src, g }
  }
  const { g } = st.purr
  g.gain.cancelScheduledValues(now)
  g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), now)
  g.gain.linearRampToValueAtTime(0.6, now + 0.5)
  st.purrUntil = Math.min(performance.now() + seconds * 1000, performance.now() + 9000)
  clearTimeout(st.timer)
  const check = () => {
    const left = st.purrUntil - performance.now()
    if (left > 50) {
      st.timer = setTimeout(check, left)
      return
    }
    stopPurr(id)
  }
  st.timer = setTimeout(check, st.purrUntil - performance.now())
}

function stopPurr(id, fade = 1.4) {
  const st = catState(id)
  if (!st.purr || !ctx) return
  const { src, g } = st.purr
  const now = ctx.currentTime
  g.gain.cancelScheduledValues(now)
  g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), now)
  g.gain.linearRampToValueAtTime(0, now + fade)
  src.stop(now + fade + 0.05)
  st.purr = null
  clearTimeout(st.timer)
}

function vocal(ac, { pitch, duration, contour, open, grit = 0, gain = 0.5 }) {
  const t0 = ac.currentTime + 0.01
  const end = t0 + duration
  const osc = ac.createOscillator()
  osc.type = 'sawtooth'
  contour.forEach(([k, f], i) => {
    const at = t0 + duration * k
    if (i === 0) osc.frequency.setValueAtTime(pitch * f, at)
    else osc.frequency.exponentialRampToValueAtTime(pitch * f, at)
  })
  const vib = ac.createOscillator()
  vib.frequency.value = 5.5 + Math.random() * 2
  const vibGain = ac.createGain()
  vibGain.gain.value = pitch * 0.018
  vib.connect(vibGain).connect(osc.frequency)

  const voice = ac.createGain()
  osc.connect(voice)
  if (grit) {
    const am = ac.createOscillator()
    am.frequency.value = 28
    const amGain = ac.createGain()
    amGain.gain.value = grit
    am.connect(amGain).connect(voice.gain)
    am.start(t0)
    am.stop(end + 0.1)
  }

  const mouth = ac.createBiquadFilter()
  mouth.type = 'lowpass'
  mouth.Q.value = 0.8
  open.forEach(([k, f], i) => {
    const at = t0 + duration * k
    if (i === 0) mouth.frequency.setValueAtTime(f, at)
    else mouth.frequency.exponentialRampToValueAtTime(f, at)
  })

  const out = ac.createGain()
  const formants = [
    [[0, 480], [0.3, 950], [1, 650]],
    [[0, 1900], [0.35, 1650], [1, 1050]],
    [[0, 2900], [1, 2700]],
  ]
  const weights = [1, 0.7, 0.35]
  formants.forEach((path, i) => {
    const bp = ac.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.value = 7
    path.forEach(([k, f], j) => {
      const at = t0 + duration * k
      if (j === 0) bp.frequency.setValueAtTime(f, at)
      else bp.frequency.exponentialRampToValueAtTime(f, at)
    })
    const w = ac.createGain()
    w.gain.value = weights[i] * 3.2
    mouth.connect(bp).connect(w).connect(out)
  })
  voice.connect(mouth)

  const env = ac.createGain()
  env.gain.setValueAtTime(0, t0)
  env.gain.linearRampToValueAtTime(gain, t0 + Math.min(0.07, duration * 0.18))
  env.gain.setValueAtTime(gain, t0 + duration * 0.62)
  env.gain.exponentialRampToValueAtTime(0.0008, end)
  out.connect(env).connect(bus)

  osc.start(t0)
  vib.start(t0)
  osc.stop(end + 0.05)
  vib.stop(end + 0.05)
}

function meow(ac, id) {
  const voice = VOICES[id] || VOICES.sill
  const p = voice.pitch * (0.92 + Math.random() * 0.16)
  const duration = (0.55 + Math.random() * 0.3) * voice.size
  vocal(ac, {
    pitch: p,
    duration,
    contour: [[0, 0.82], [0.32, 1.14], [0.7, 1.0], [1, 0.74]],
    open: [[0, 650], [0.3, 3600], [0.75, 2200], [1, 900]],
    gain: 0.42,
  })
}

function mrrp(ac, id) {
  const voice = VOICES[id] || VOICES.sill
  const p = voice.pitch * (0.95 + Math.random() * 0.1)
  vocal(ac, {
    pitch: p,
    duration: 0.24 * voice.size,
    contour: [[0, 0.78], [0.6, 1.12], [1, 1.04]],
    open: [[0, 700], [0.5, 2600], [1, 1600]],
    grit: 0.55,
    gain: 0.36,
  })
}

function grumble(ac, id) {
  const voice = VOICES[id] || VOICES.sill
  vocal(ac, {
    pitch: voice.pitch * 0.62,
    duration: 0.75 * voice.size,
    contour: [[0, 0.95], [0.25, 1.1], [1, 0.7]],
    open: [[0, 500], [0.3, 1800], [1, 600]],
    grit: 0.8,
    gain: 0.38,
  })
}

export function petCat(id) {
  const st = catState(id)
  const now = performance.now()
  let kind = 'purr'
  if (now < st.annoyedUntil) {
    kind = 'ignore'
  } else {
    st.pets = st.pets.filter((t) => now - t < 3200)
    st.pets.push(now)
    if (st.pets.length >= 7) {
      kind = 'annoyed'
      st.annoyedUntil = now + 6000
      st.pets = []
    } else if (now - st.lastMeow > 2400 && Math.random() < (st.pets.length === 1 ? 0.6 : 0.22)) {
      kind = Math.random() < 0.7 ? 'meow' : 'mrrp'
      st.lastMeow = now
    }
  }
  ui.set((s) => ({ pet: { id, kind, n: (s.pet?.n || 0) + 1 } }))
  const ac = audio()
  if (!ac || kind === 'ignore') return kind
  if (kind === 'annoyed') {
    stopPurr(id, 0.3)
    grumble(ac, id)
    return kind
  }
  startPurr(ac, id, 3.5 + st.pets.length * 0.6)
  if (kind === 'meow') meow(ac, id)
  if (kind === 'mrrp') mrrp(ac, id)
  return kind
}

let chirps = []

export function chirp() {
  const now = performance.now()
  chirps = chirps.filter((t) => now - t < 2000)
  if (chirps.length && now - chirps[chirps.length - 1] < 140) return
  chirps.push(now)
  const ac = audio()
  if (!ac) return
  const tired = chirps.length > 6
  const patterns = [
    [0, 4, 7, 12],
    [0, 7, 12],
    [12, 7, 4, 0],
    [0, 5, 9],
    [0, 12, 7, 16],
  ]
  const notes = tired ? [7, 4, 0, -5] : patterns[Math.floor(Math.random() * patterns.length)]
  const base = tired ? 72 : 76 + Math.floor(Math.random() * 3)
  const step = tired ? 0.11 : 0.065
  const t0 = ac.currentTime + 0.01
  const lp = ac.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 3800
  const g = ac.createGain()
  g.gain.value = tired ? 0.12 : 0.16
  lp.connect(g).connect(bus)
  notes.forEach((n, i) => {
    const f = 440 * Math.pow(2, (base + n - 69) / 12)
    const at = t0 + i * step
    const osc = ac.createOscillator()
    osc.type = i % 2 ? 'triangle' : 'square'
    osc.frequency.setValueAtTime(f * 0.97, at)
    osc.frequency.exponentialRampToValueAtTime(f, at + 0.02)
    const e = ac.createGain()
    e.gain.setValueAtTime(0, at)
    e.gain.linearRampToValueAtTime(1, at + 0.006)
    e.gain.exponentialRampToValueAtTime(0.001, at + step * 1.6)
    osc.connect(e).connect(lp)
    osc.start(at)
    osc.stop(at + step * 1.7)
  })
}

let lastFlick = 0

export function flick(on) {
  const now = performance.now()
  if (now - lastFlick < 60) return
  lastFlick = now
  const ac = audio()
  if (!ac) return
  const t = ac.currentTime + 0.005
  const sr = ac.sampleRate
  const len = Math.round(sr * 0.03)
  const buffer = ac.createBuffer(1, len, sr)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.0025))
  const src = ac.createBufferSource()
  src.buffer = buffer
  const bp = ac.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = on ? 3200 : 2500
  bp.Q.value = 1.4
  const g = ac.createGain()
  g.gain.value = 0.5
  src.connect(bp).connect(g).connect(bus)
  src.start(t)
  const osc = ac.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(on ? 190 : 150, t)
  osc.frequency.exponentialRampToValueAtTime(70, t + 0.04)
  const og = ac.createGain()
  og.gain.setValueAtTime(0.22, t)
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
  osc.connect(og).connect(bus)
  osc.start(t)
  osc.stop(t + 0.06)
}
