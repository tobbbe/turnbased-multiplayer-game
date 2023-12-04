'use client'
import React from 'react'
import './game.css'
import { Updater, useImmer } from 'use-immer'
import { WorldData, Coordinate, GameState, TileConfig, Player } from '../../types'
import { mutators } from 'multiplayer'
import { Reflect } from '@rocicorp/reflect/client'
import { useSubscribe, usePresence } from '@rocicorp/reflect/react'

const isDev = process.env.NODE_ENV === 'development'

type GameContext = { gs: GameState; gsUpdate: Updater<GameState> }
const GameContext = React.createContext<GameContext>({} as GameContext)
type ReflectClient = Reflect<typeof mutators>

export const Game: React.FC<{
  worldData: WorldData
}> = ({ worldData }) => {
  const reflectInstance = React.useRef<ReflectClient | null>(null)
  const [isOnline, setIsOnline] = React.useState(false)
  const [gameState, setGame] = useImmer<GameState>({
    world: worldData,
    ui: { showCoords: false },
    players: [],
  })

  React.useEffect(() => {
    const userID = window.location.href.split('?')[1] || 'no-user-id'

    if (reflectInstance.current) return

    const server = isDev ? 'http://localhost:8080' : process.env.SERVER_URL
    console.log(server)

    console.log('Reflect: setup')
    const _reflect = new Reflect({
      roomID: 'room',
      userID,
      mutators,
      server,
      enableAnalytics: false,
      // logLevel: 'debug',
      onOnlineChange(online) {
        console.log('Reflect online:', online)
        setIsOnline(online)
      },
    })

    _reflect.subscribe(
      (tx) => tx.scan().entries().toArray(),
      (val) => console.log('reflect changed', val)
    )

    reflectInstance.current = _reflect

    console.log('Reflect: setup - done')

    return () => {
      _reflect.close()
      reflectInstance.current = null
      console.log('Reflect: closed')
    }
  }, [])

  const r = reflectInstance.current

  if (!r?.userID)
    return <p style={{ fontSize: '32px', color: 'white', padding: '20px' }}>Waiting for reflect</p>
  if (r?.userID === 'no-user-id')
    return (
      <div style={{ fontSize: '32px', color: 'white', padding: '20px' }}>
        No user id. Add to url. Ex: localhost:6660?player22
      </div>
    )
  if (!isOnline) {
    return <div style={{ color: 'white', fontSize: '32px', padding: '20px' }}>Connecting...</div>
  }

  return (
    <GameContext.Provider value={{ gs: gameState, gsUpdate: setGame }}>
      {r && <GameInner reflect={r} />}
    </GameContext.Provider>
  )
}

const GameInner: React.FC<{ reflect: ReflectClient }> = ({ reflect: r }) => {
  const { gs, gsUpdate } = useGame()
  const presentClientIDs = usePresence(r)
  const allPlayers = useSubscribe(r, (tx) => tx.get<Player[]>('players'), null, [])

  const presentPlayers = useSubscribe(
    r,
    async (tx) => {
      const result = []
      for (const clientID of presentClientIDs) {
        const players = await tx.get<Player[]>('players')
        const presentClient = players?.find((x) => x.id === clientID)
        if (presentClient) {
          result.push(presentClient)
        }
      }
      return result
    },
    [],
    [presentClientIDs]
  )

  const currentPlayer = useSubscribe(
    r,
    async (tx) => {
      const players = await tx.get<Player[]>('players')
      const player = players?.find((x) => x.id === r.userID)
      return player
    },
    null,
    []
  )
  useControllers(currentPlayer, r)

  React.useEffect(() => {
    r.mutate.setup({ name: r.userID, id: r.userID })
  }, [r.mutate, r.userID])

  React.useEffect(() => {
    gsUpdate((draft) => {
      draft.players = allPlayers as Player[]
    })
  }, [allPlayers, gsUpdate])

  return (
    <>
      <div style={{ position: 'fixed', bottom: 0, zIndex: 999, color: 'white', padding: '10px' }}>
        <pre style={{ fontSize: 9 }}>
          {JSON.stringify(
            {
              online: r.online,
              currentPlayer,
              restOfPlayers: allPlayers?.filter((x) => x.id !== r.userID),
            },
            null,
            2
          )}
        </pre>
      </div>
      <div id="world-container">
        <div id="world-map">
          {gs.world.map.tiles.map((latitude, latIndex) => {
            return (
              <div className="lat" key={latIndex}>
                {latitude.map((tileType, tileIndex) => {
                  return (
                    <Tile
                      coordinate={{ x: tileIndex, y: latIndex }}
                      key={tileIndex}
                      players={allPlayers as Player[]}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
        <Settings />
      </div>
    </>
  )
}

function Tile({
  coordinate,
  players,
}: {
  coordinate: Coordinate
  players: Player[] | null
}): JSX.Element {
  const { gs } = useGame()
  const tile = tileConfig(coordinate, gs)

  return (
    <div className={tile.className + ' relative'}>
      {tile.className !== 'c' &&
        players
          ?.filter((x) => x.location.x === tile.relativeX && x.location.y === tile.relativeY)
          .map((x) => (
            <div key={x.name} className="player">
              🐈‍⬛
            </div>
          ))}
      {gs.ui.showCoords ? `${tile.relativeX},${tile.relativeY}` : ''}
    </div>
  )
}

function tileConfig(absolutePos: Coordinate, game: GameState): TileConfig {
  const tile = game.world.map.tiles[absolutePos.y]?.[absolutePos.x]
  if (!tile) throw new Error("Tile doesn't exist")

  return {
    relativeX: absolutePos.x - game.world.map.centerTile.x,
    relativeY: game.world.map.centerTile.y - absolutePos.y,
    absoluteX: absolutePos.x,
    absoluteY: absolutePos.y,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    className:
      tile === 'c' ? 'c' : game.world.map.types[game.world.map.locations[tile]!.type]?.id || 'err',
  }
}

function useGame(): GameContext {
  const game = React.useContext(GameContext)
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
          game.gsUpdate((draft) => {
            draft.ui.showCoords = !draft.ui.showCoords
          })
        }>
        Toggle coords
      </button>
    </div>
  )
}

function useControllers(player: Player | null, r: ReflectClient): null {
  const [lastMove, setLastMove] = React.useState<Date | null>(new Date())

  React.useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (!player || !r.online) return
      if (lastMove === null || (lastMove && new Date().getTime() - lastMove.getTime() < 100)) return

      setLastMove(null) // block

      switch (e.key) {
        case 'ArrowUp':
          r.mutate.movePlayer({ playerId: player.id, dir: 'up' })
          break
        case 'ArrowDown':
          r.mutate.movePlayer({ playerId: player.id, dir: 'down' })
          break
        case 'ArrowLeft':
          r.mutate.movePlayer({ playerId: player.id, dir: 'left' })
          break
        case 'ArrowRight':
          r.mutate.movePlayer({ playerId: player.id, dir: 'right' })
          break
        default:
          return
      }

      // setGame((draft) => {
      //   draft.players.find((x) => x.id === player.id)!.location = newLocation
      // })

      setLastMove(new Date())
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lastMove, player, r.mutate, r.online])

  return null
}
