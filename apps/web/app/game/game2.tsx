'use client'
import React from 'react'
import './game.css'

const WorldContext = React.createContext<World | null>(null)

export const Game = ({ worldData }: { worldData: WorldData }) => {
  return (
    <WorldContext.Provider value={{ ...worldData, config: { centerTile: calcCenter(worldData) } }}>
      <GameInner />
    </WorldContext.Provider>
  )
}

const GameInner = () => {
  const world = useWorld()

  return (
    <div id="world-container">
      <div id="world-map">
        {world.map.tiles.map((latitude, latIndex) => {
          return (
            <div className="lat" key={latIndex}>
              {latitude.map((tileType, tileIndex) => {
                return (
                  <Tile tile={tileConfig({ x: tileIndex, y: latIndex }, world)} key={tileIndex} />
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Tile({ tile }: { tile: ReturnType<typeof tileConfig> }) {
  return <div className={tile.className}>{`${tile.x},${tile.y}`}</div>
}

type WorldData = {
  map: {
    tiles: Array<Array<TileType>>
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

type World = {
  config: {
    centerTile: Coordinate
  }
} & WorldData

type TileType = number | 'c'
type Coordinate = { x: number; y: number }

function tileConfig(absolutePos: Coordinate, world: World) {
  const tile = world.map.tiles[absolutePos.y][absolutePos.x]

  return {
    x: absolutePos.x - world.config.centerTile.x,
    y: world.config.centerTile.y - absolutePos.y,
    absolutePos,
    className: tile === 'c' ? 'c' : world.map.types[world.map.locations[tile].type].id,
  }
}

function useWorld() {
  const world = React.useContext(WorldContext)
  if (!world) throw new Error('World is null')
  return world
}
function calcCenter(world: WorldData): Coordinate {
  for (let latIndex = 0; latIndex < world.map.tiles.length; latIndex++) {
    const latitude = world.map.tiles[latIndex]
    for (let tileIndex = 0; tileIndex < latitude.length; tileIndex++) {
      if (latitude[tileIndex] === 'c') {
        return { x: tileIndex, y: latIndex }
      }
    }
  }
  throw new Error('Cant find center')
}
