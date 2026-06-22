export type Track = {
  id: string
  title: string
  emoji: string
  description: string
  accentColor: string
  totalProblems: number
  href: string
  enabled: boolean
}

export const tracks: Track[] = [
  {
    id: 'design-patterns',
    title: 'Design Patterns',
    emoji: '🧱',
    description: 'Singleton · Factory · Strategy · Observer · 30 problems across 4 phases',
    accentColor: '#E8FF47',
    totalProblems: 30,
    href: '/tracks/design-patterns',
    enabled: true,
  },
  {
    id: 'dsa',
    title: 'DSA Patterns',
    emoji: '🧮',
    description: 'Sliding Window · Two Pointers · Trees · Graphs · DP',
    accentColor: '#00FF94',
    totalProblems: 77,
    href: '/tracks/dsa',
    enabled: true,
  },
  {
    id: 'lld',
    title: 'Low Level Design',
    emoji: '🔩',
    description: 'Machine coding rounds · Class diagrams · SOLID principles',
    accentColor: '#FFB347',
    totalProblems: 0,
    href: '/tracks/lld',
    enabled: false,
  },
  {
    id: 'system-design',
    title: 'System Design',
    emoji: '🏗️',
    description: 'HLD · Scalability · CAP theorem · Real system walkthroughs',
    accentColor: '#FF4747',
    totalProblems: 0,
    href: '/tracks/system-design',
    enabled: false,
  },
  {
    id: 'oops',
    title: 'OOP Concepts',
    emoji: '🧬',
    description: 'Polymorphism · Inheritance · Encapsulation · Abstraction',
    accentColor: '#47FFD4',
    totalProblems: 0,
    href: '/tracks/oops',
    enabled: false,
  },
  {
    id: 'databases',
    title: 'Databases',
    emoji: '🗄️',
    description: 'SQL · Indexing · Normalization · Query optimisation',
    accentColor: '#FF47B3',
    totalProblems: 0,
    href: '/tracks/databases',
    enabled: false,
  },
]
