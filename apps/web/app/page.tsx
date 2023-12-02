import { WorldData, Coordinate } from '../types'
import { Game } from './game/game'
import fs from 'fs'

export default function Web(): JSX.Element {
  const worldData = JSON.parse(fs.readFileSync('./world.json', { encoding: 'utf-8' })) as WorldData
  worldData.map.centerTile = calcCenter(worldData)

  return <Game worldData={worldData} />
}

function calcCenter(world: WorldData): Coordinate {
  for (let latIndex = 0; latIndex < world.map.tiles.length; latIndex++) {
    const latitude = world.map.tiles[latIndex]
    if (!latitude) continue
    for (let tileIndex = 0; tileIndex < latitude.length; tileIndex++) {
      if (latitude[tileIndex] === 'c') {
        return { x: tileIndex, y: latIndex }
      }
    }
  }
  throw new Error('Cant find center')
}
