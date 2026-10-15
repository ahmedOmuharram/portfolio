const FACES = ['600 34px Fraunces', 'italic 600 46px Fraunces', 'italic 30px Fraunces', '400 30px Manrope', '600 26px "JetBrains Mono"', '21px "JetBrains Mono"']

let ready = null

export function canvasFontsReady() {
  if (!ready) {
    const load = document.fonts ? Promise.all(FACES.map((f) => document.fonts.load(f).catch(() => null))) : Promise.resolve()
    ready = Promise.race([load, new Promise((r) => setTimeout(r, 3000))])
  }
  return ready
}
