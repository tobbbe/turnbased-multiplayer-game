'use client'
import React from 'react'
import './game.css'
import { useImmer } from 'use-immer'
import { WorldData, Coordinate, GameState, TileConfig } from '../../types'

const GameContext = React.createContext<GameState>({} as GameState)

export const Game: React.FC<{
  worldData: WorldData
}> = ({ worldData }) => {
  const [game, setGame] = useImmer<GameState>({} as GameState)

  React.useEffect(() => {
    setGame({
      world: worldData,
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

const GameInner: React.FC = () => {
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

function Tile({ coordinate }: { coordinate: Coordinate }): JSX.Element {
  const game = useGame()
  const tile = tileConfig(coordinate, game)

  return (
    <div className={tile.className}>
      {game.ui.showCoords ? `${tile.relativeX},${tile.relativeY}` : ''}
    </div>
  )
}

function tileConfig(absolutePos: Coordinate, game: GameState): TileConfig {
  const tile = game.world.map.tiles[absolutePos.y][absolutePos.x]

  return {
    relativeX: absolutePos.x - game.world.map.centerTile.x,
    relativeY: game.world.map.centerTile.y - absolutePos.y,
    absoluteX: absolutePos.x,
    absoluteY: absolutePos.y,
    className: tile === 'c' ? 'c' : game.world.map.types[game.world.map.locations[tile].type].id,
  }
}

function useGame(): GameState {
  const game = React.useContext(GameContext)

  if (!game) throw new Error('World is null')
  return game
}

function Settings(): JSX.Element {
  const game = useGame()

  return (
    <div
      id="settings"
      className={'hidden'}
      onClick={(e) => e.currentTarget.classList.toggle('hidden')}>
      <button
        onClick={() =>
          game.update((draft) => {
            draft.ui.showCoords = !draft.ui.showCoords
          })
        }>
        Toggle coords
      </button>
    </div>
  )
}
