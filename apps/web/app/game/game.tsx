'use client'
import React, { useState, useEffect } from 'react'
import './App.css'

type Player = {
  id: number
  name: string
  position: { x: number; y: number }
  color: 'red' | 'blue'
}
type Grid = number[][]
const initialPlayers: Player[] = [
  { id: 1, name: 'Player 1', position: { x: 0, y: 0 }, color: 'red' },
  { id: 2, name: 'Player 2', position: { x: 9, y: 9 }, color: 'blue' },
]

export const Game = () => {
  const [gridData, setGridData] = useState<Grid>([])
  const [players, setPlayers] = useState<Player[]>(initialPlayers)

  useEffect(() => {
    const grid = Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => 0))
    setGridData(grid)
  }, [])

  // Send move or attack to the server
  const sendAction = async () => {
    try {
      // const response = await axios.post('/api/game/action', {
      //   playerId,
      //   action,
      //   newPosition,
      // });
      // // Update local state based on server response
      // setPlayers(response.data.players);
    } catch (error) {
      console.error('Error sending action:', error)
    }
  }

  useEffect(() => {
    setTimeout(() => {
      //   sendAction(1, 'move', { x: 3, y: 0 });
      setPlayers([
        { id: 1, name: 'Player 1', position: { x: 3, y: 0 }, color: 'red' },
        { id: 2, name: 'Player 2', position: { x: 9, y: 9 }, color: 'blue' },
      ])
    }, 2000)
  }, [])

  return (
    <div className="App">
      <Grid gridData={gridData} players={players} />
    </div>
  )
}

const Grid = ({ gridData, players }: { gridData: Grid; players: Player[] }) => {
  return (
    <div className="grid">
      {gridData.map((row, y) => (
        <div key={y} className="row">
          {row.map((cell, x) => (
            <div key={x} className="cell">
              <div className="cell-pos">
                {y},{x}
              </div>
              {players
                .filter((player) => player.position.x === x && player.position.y === y)
                .map((player, index) => (
                  <PlayerTile key={index} player={player} />
                ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

const PlayerTile = ({ player }: { player: Player }) => {
  return (
    <div className="player" style={{ backgroundColor: player.color }} title={player.name}></div>
  )
}
