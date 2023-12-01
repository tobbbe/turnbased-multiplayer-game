import type { WriteTransaction } from '@rocicorp/reflect'

async function setup(tx: WriteTransaction, delta: { name: string; id: string }) {
  const players = (await tx.get<Player[]>('players')) ?? []
  const player = players.find((x) => x.id === delta.id)
  await tx.set('players', [
    ...players.filter((x) => x.id !== player?.id),
    { location: { x: 0, y: 0 }, ...player, ...delta },
  ])
}

async function movePlayer(
  tx: WriteTransaction,
  delta: { playerId: string; dir: 'up' | 'down' | 'left' | 'right' }
) {
  const players = (await tx.get<Player[]>('players')) ?? []
  const player = players.find((x) => x.id === delta.playerId)
  if (!player) return

  const deltaPlayerLocation = { ...player.location }
  switch (delta.dir) {
    case 'up':
      deltaPlayerLocation.y += 1
      break
    case 'down':
      deltaPlayerLocation.y -= 1
      break
    case 'left':
      deltaPlayerLocation.x -= 1
      break
    case 'right':
      deltaPlayerLocation.x += 1
      break
  }
  const deltaPlayer = {
    ...player,
    location: deltaPlayerLocation,
  }
  const deltaPlayers = [...players.filter((x) => x.id !== player?.id), deltaPlayer]

  await tx.set('players', deltaPlayers)
}

export const mutators = {
  setup,
  movePlayer,
}

export type Player = {
  id: string
  name: string
  location: { x: number; y: number }
  movement: number
}
