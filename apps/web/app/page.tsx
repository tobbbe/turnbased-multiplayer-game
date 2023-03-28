import { Game } from './game/game'
import fs from 'fs'

export default function Web() {
  const data = fs.readFileSync('./world.json', { encoding: 'utf-8' })
  return (
    <div>
      <Game worldData={JSON.parse(data)} />
    </div>
  )
}
