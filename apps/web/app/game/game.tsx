'use client'
import React from 'react'
import './game.css'
import { Updater, useImmer } from 'use-immer'

const GameContext = React.createContext<Game>({} as Game)

export const Game = ({ worldData }: { worldData: WorldData }) => {
  const [game, setGame] = useImmer<Game>({} as Game)

  React.useEffect(() => {
    setGame({
      world: worldData,
      config: { centerTile: calcCenter(worldData) },
      ui: { showCoords: false },
      update: setGame,
    })
  }, [setGame, worldData])

  if (!game?.world) return null

  return (
    <GameContext.Provider value={game}>
      <GameInner />
    </GameContext.Provider>
  )
}

const GameInner = () => {
  const { world } = useGame()

  return (
    <div id="world-container">
      <div id="world-map">
        {world.map.tiles.map((latitude, latIndex) => {
          return (
            <div className="lat" key={latIndex}>
              {latitude.map((tileType, tileIndex) => {
                return <Tile coordinate={{ x: tileIndex, y: latIndex }} key={tileIndex} />
              })}
            </div>
          )
        })}
      </div>
      <Settings />
    </div>
  )
}

function Tile({ coordinate }: { coordinate: Coordinate }) {
  const game = useGame()
  const tile = tileConfig(coordinate, game)

  return (
    <div className={tile.className}>
      {game.ui.showCoords ? `${tile.relativeX},${tile.relativeY}` : ''}
    </div>
  )
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
type Game = {
  world: WorldData
  config: {
    centerTile: Coordinate
  }
  ui: {
    showCoords: boolean
  }
  update: Updater<Game>
}
type TileType = number | 'c'
type Coordinate = { x: number; y: number }

function tileConfig(absolutePos: Coordinate, game: Game) {
  const tile = game.world.map.tiles[absolutePos.y][absolutePos.x]

  return {
    relativeX: absolutePos.x - game.config.centerTile.x,
    relativeY: game.config.centerTile.y - absolutePos.y,
    absoluteX: absolutePos.x,
    absoluteY: absolutePos.y,
    className: tile === 'c' ? 'c' : game.world.map.types[game.world.map.locations[tile].type].id,
  }
}

function useGame() {
  const game = React.useContext(GameContext)

  if (!game) throw new Error('World is null')
  return game
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

function Settings() {
  const game = useGame()

  return (
    <div
      id="settings"
      className={'hidden'}
      onClick={(e) => e.currentTarget.classList.toggle('hidden')}>
      <button
        onClick={() =>
          game.update((draft) => {
            draft.ui.showCoords = !draft?.ui.showCoords
          })
        }>
        Toggle coords
      </button>
    </div>
  )
}
