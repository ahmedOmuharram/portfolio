export const SHOTS = {
  home: { pos: [2.6, 1.95, 2.9], target: [-0.9, 0.88, -2.4], fov: 50 },
  about: { pos: [1.6, 1.5, -0.2], target: [-1.15, 1.3, -3.0], fov: 42 },
  experience: { pos: [0.6, 1.5, -0.9], target: [3.5, 1.5, -2.15], fov: 45 },
  research: { pos: [-0.6, 1.48, -1.3], target: [0.25, 0.85, -2.45] },
  projects: { pos: [-0.15, 1.25, -1.45], target: [0.42, 1.05, -2.55], fov: 42 },
  writing: { pos: [-1.0, 1.42, 0.35], target: [-3.5, 1.2, 1.1] },
  contact: { pos: [1.0, 1.3, 0.9], target: [3.4, 0.85, -1.6], fov: 48 },
}

export const SECTION_IDS = Object.keys(SHOTS)

export const SECTION_LABELS = {
  home: 'home',
  about: 'about',
  experience: 'work',
  research: 'research',
  projects: 'projects',
  writing: 'writing',
  contact: 'say hi',
}
