import { BoardColorsEnum } from './board-colors.enum'
import { CommentsCountByUserInterface } from './comments-count-by-user.interface'

export interface BoardWithListsAndCardsInterface {
    id: number
    name: string
    color: BoardColorsEnum
    isCurrentUserAdmin: boolean
    liked: boolean
    lists: ListInterface[]
}

interface CardInterface {
    id: number
    name: string
    commentsCount: number
    commentsCountByUser: CommentsCountByUserInterface[]
    hasExecutor: boolean
    executorId: number | null
}

interface ListInterface {
    id: number,
    name: string,
    cards: CardInterface[]
}
