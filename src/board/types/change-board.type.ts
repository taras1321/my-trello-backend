import { BoardEntity } from '../board.entity'

export type ChangeBoardType = Pick<BoardEntity, 'id' | 'name' | 'color'>