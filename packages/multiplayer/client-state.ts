import { generate } from '@rocicorp/rails'
import type { WriteTransaction } from '@rocicorp/reflect'

const colors = [
  '#f94144',
  '#f3722c',
  '#f8961e',
  '#f9844a',
  '#f9c74f',
  '#90be6d',
  '#43aa8b',
  '#4d908e',
  '#577590',
  '#277da1',
]
const avatars = [
  ['🐶', 'Puppy'],
  ['🐱', 'Kitty'],
  ['🐭', 'Mouse'],
  ['🐹', 'Hamster'],
  ['🐰', 'Bunny'],
  ['🦊', 'Fox'],
  ['🐻', 'Bear'],
  ['🐼', 'Panda'],
  ['🐻‍❄️', 'Polar Bear'],
  ['🐨', 'Koala'],
  ['🐯', 'Tiger'],
  ['🦁', 'Lion'],
  ['🐮', 'Cow'],
  ['🐷', 'Piggy'],
  ['🐵', 'Monkey'],
  ['🐣', 'Chick'],
]

import { z } from 'zod'

export const userInfoSchema = z.object({
  avatar: z.string(),
  name: z.string(),
  color: z.string(),
})

export const clientStateSchema = z.object({
  id: z.string(),
  cursor: z.union([
    z.object({
      x: z.number(),
      y: z.number(),
    }),
    z.null(),
  ]),
  userInfo: userInfoSchema,
})

export type UserInfo = z.infer<typeof userInfoSchema>
export type ClientState = z.infer<typeof clientStateSchema>

export const {
  init: initClientState,
  get: getClientState,
  mustGet: mustGetClientState,
  put: putClientState,
  update: updateClientState,
} = generate('client-state', clientStateSchema.parse)

export async function setCursor(
  tx: WriteTransaction,
  { x, y }: { x: number; y: number }
): Promise<void> {
  await updateClientState(tx, { id: tx.clientID, cursor: { x, y } })
}

export function randUserInfo(): UserInfo {
  const [avatar, name] = avatars[randInt(0, avatars.length - 1)]
  return {
    avatar,
    name,
    color: colors[randInt(0, colors.length - 1)],
  }
}

export function randInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1) + min) //The maximum is inclusive and the minimum is inclusive
}
