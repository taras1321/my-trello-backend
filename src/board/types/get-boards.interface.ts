interface BoardInterface {
    id: number
    name: string
    color: string
    membersCount: number
    liked: boolean
}

export interface GetBoardsInterface {
    boards: BoardInterface[]
    boardsCount: number
}