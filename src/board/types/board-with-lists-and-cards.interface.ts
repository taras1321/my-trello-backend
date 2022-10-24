import { BoardColorsEnum } from './board-colors.enum'

export interface BoardWithListsAndCardsInterface {
    id: number
    name: string
    color: BoardColorsEnum
    isCurrentUserAdmin: boolean
    lists: ListInterface[]
}

interface CardInterface {
    id: number
    name: string
    commentsCount: number
    hasExecutor: boolean
}

interface ListInterface {
    id: number,
    name: string,
    cards: CardInterface[]
}
