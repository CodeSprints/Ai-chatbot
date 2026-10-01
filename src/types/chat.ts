export type Role = 'user' | 'assistant'

export type Message = {
  id: string
  role: Role
  content: string
  createdAt: number
}

export type Thread = {
  id: string
  title: string
  messages: Message[]
  updatedAt: number
}
