import { useMemo } from 'react'
import { Quaternion, Vector3 } from 'three'

const up = new Vector3(0, 1, 0)

export function Segment({ a, b, radius = 0.01, material, radialSegments = 8, cast = true }) {
  const { position, quaternion, length } = useMemo(() => {
    const va = new Vector3(...a)
    const vb = new Vector3(...b)
    const dir = vb.clone().sub(va)
    const len = dir.length()
    const q = new Quaternion().setFromUnitVectors(up, dir.normalize())
    return { position: va.add(vb).multiplyScalar(0.5).toArray(), quaternion: q, length: len }
  }, [a, b])
  return (
    <mesh position={position} quaternion={quaternion} material={material} castShadow={cast}>
      <cylinderGeometry args={[radius, radius, length, radialSegments]} />
    </mesh>
  )
}

export function Block({ size, position, rotation, material, cast = true, receive = true, children, ...rest }) {
  return (
    <mesh position={position} rotation={rotation} material={material} castShadow={cast} receiveShadow={receive} {...rest}>
      <boxGeometry args={size} />
      {children}
    </mesh>
  )
}
