import { CardEntity } from '../card.entity'

export type GetFullCardResponseType = CardEntity & {
    currentUserId: number
    isCurrentUserAdmin: boolean
}