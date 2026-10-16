import Desk from './Desk'
import Corner from './Corner'
import Music from './Music'
import Board from './Board'
import Cats from './Cats'
import StringLights from './StringLights'
import Dust from './Dust'
import SunBeams from './SunBeams'
import { Bookshelf, WallShelf } from './Shelves'
import { HangingPlanter, LeafyPlant, Pot, SnakePlant } from './Plants'
import { useMaterials } from './materials'

export default function Furniture() {
  const m = useMaterials()
  return (
    <group>
      <Desk />
      <Corner />
      <Music />
      <Board />
      <Bookshelf />
      <WallShelf />
      <StringLights />
      <Cats />
      <Dust />
      <SunBeams />
      <group position={[-3.05, 0, -2.66]}>
        <Pot radius={0.24} height={0.42} material={m.potDark} />
        <LeafyPlant kind="monstera" count={11} height={1.1} spread={0.5} size={0.95} base={0.4} seed={4} droop={0.35} color="#2f5a37" />
      </group>
      <group position={[-1.5, 0.83, -2.93]}>
        <Pot radius={0.08} height={0.13} />
        <SnakePlant height={0.42} base={0.12} count={9} />
      </group>
      <group position={[1.18, 0.83, -2.88]}>
        <Pot radius={0.06} height={0.1} material={m.ceramic} />
        <LeafyPlant kind="leaf" count={8} height={0.14} spread={0.1} size={0.55} base={0.1} seed={61} droop={0.4} color="#4f7c46" />
      </group>
      <group position={[3.08, 0, 1.15]}>
        <Pot radius={0.2} height={0.36} />
        <LeafyPlant kind="leaf" count={16} height={0.8} spread={0.36} size={1.0} base={0.34} seed={71} droop={0.25} color="#3c6a3a" />
      </group>
      <HangingPlanter position={[-2.25, 3.1, -2.15]} length={0.6} />
    </group>
  )
}
