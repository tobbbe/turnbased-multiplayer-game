import { Updater } from 'use-immer'

export type WorldData = {
  map: {
    tiles: Array<Array<TileType>>
    centerTile: Coordinate
    locations: {
      name: string
      type: number
    }[]
    types: {
      name: string
      label: string
      id: string
      movement: number
    }[]
  }
}
export type GameState = {
  world: WorldData
  ui: {
    showCoords: boolean
  }
  players: Player[]
}
export type TileType = number | 'c'
export type Coordinate = { x: number; y: number }
export type TileConfig = {
  relativeX: number
  relativeY: number
  absoluteX: number
  absoluteY: number
  className: string
}

export type Player = {
  id: string
  name: string
  location: Coordinate
  movement: number
}
