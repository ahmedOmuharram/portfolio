const FACES = ['600 46px "Pixelify Sans"', '500 30px "Pixelify Sans"', '600 34px "Pixelify Sans"', '22px DotGothic16']

let ready = null

export function canvasFontsReady() {
  if (!ready) {
    const load = document.fonts ? Promise.all(FACES.map((f) => document.fonts.load(f).catch(() => null))) : Promise.resolve()
    ready = Promise.race([load, new Promise((r) => setTimeout(r, 3000))])
  }
  return ready
}
