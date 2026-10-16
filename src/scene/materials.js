import { useMemo } from 'react'
import { MeshStandardMaterial, DoubleSide } from 'three'
import { floorTexture, plasterTexture, woodTexture } from './textures'

let shared = null

export function getMaterials() {
  if (shared) return shared
  shared = {
    wall: new MeshStandardMaterial({ map: plasterTexture('#2a3d33'), roughness: 0.95 }),
    wallSide: new MeshStandardMaterial({ map: plasterTexture('#283a31', 13), roughness: 0.95 }),
    ceiling: new MeshStandardMaterial({ color: '#1d2420', roughness: 1 }),
    floor: new MeshStandardMaterial({ map: floorTexture(), roughness: 0.62, metalness: 0.02 }),
    trim: new MeshStandardMaterial({ color: '#1f2a24', roughness: 0.7 }),
    steel: new MeshStandardMaterial({ color: '#141414', roughness: 0.45, metalness: 0.6 }),
    wood: new MeshStandardMaterial({ map: woodTexture(3, [118, 76, 46]), roughness: 0.55 }),
    woodDark: new MeshStandardMaterial({ map: woodTexture(9, [66, 42, 28]), roughness: 0.6 }),
    woodLight: new MeshStandardMaterial({ map: woodTexture(5, [156, 112, 72]), roughness: 0.6 }),
    black: new MeshStandardMaterial({ color: '#111111', roughness: 0.55, metalness: 0.2 }),
    plastic: new MeshStandardMaterial({ color: '#1a1b1e', roughness: 0.4, metalness: 0.1 }),
    ceramic: new MeshStandardMaterial({ color: '#e9e1d2', roughness: 0.35 }),
    terracotta: new MeshStandardMaterial({ color: '#a4583a', roughness: 0.85 }),
    potDark: new MeshStandardMaterial({ color: '#2b2d2c', roughness: 0.8 }),
    soil: new MeshStandardMaterial({ color: '#2a1d14', roughness: 1 }),
    fabric: new MeshStandardMaterial({ color: '#5a3b2e', roughness: 1 }),
    fabricGreen: new MeshStandardMaterial({ color: '#2e4636', roughness: 1 }),
    cream: new MeshStandardMaterial({ color: '#d9cdb6', roughness: 0.9 }),
    curtain: new MeshStandardMaterial({ color: '#d2c6ae', roughness: 1, side: DoubleSide }),
    brass: new MeshStandardMaterial({ color: '#b08a4a', roughness: 0.35, metalness: 0.85 }),
    leaf: new MeshStandardMaterial({ color: '#3d6b3f', roughness: 0.7, side: DoubleSide }),
    leafDark: new MeshStandardMaterial({ color: '#2a4d30', roughness: 0.7, side: DoubleSide }),
    stem: new MeshStandardMaterial({ color: '#4c5a2e', roughness: 0.9 }),
  }
  return shared
}

export function useMaterials() {
  return useMemo(() => getMaterials(), [])
}
