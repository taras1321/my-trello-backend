import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BoardEntity } from '../board/board.entity'
import { BoardService } from '../board/board.service'
import { CreateListDto } from './dto/create-list.dto'
import { ListEntity } from './list.entity'

@Injectable()
export class ListService {
    
    constructor(
        @InjectRepository(ListEntity) private listRepository: Repository<ListEntity>,
        @InjectRepository(BoardEntity) private boardRepository: Repository<BoardEntity>,
        private boardService: BoardService
    ) {
    }
    
    async creatList(createListDto: CreateListDto, currentUserId: number): Promise<ListEntity> {
        const board = await this.boardService.getBoardById(createListDto.boardId, currentUserId)
        
        if (!this.boardService.isUserAdmin(currentUserId, board)) {
            throw new ForbiddenException('You do not have access to add members')
        }
        
        const newList = this.listRepository.create({
            name: createListDto.name,
            board
        })
        
        await this.listRepository.save(newList)
        board.order.push({ listId: newList.id, cardsIds: [] })
        await this.boardRepository.save(board)
        delete newList.board
        
        return newList
    }
    
    async getListById(id: number): Promise<ListEntity> {
        const list = await this.listRepository.findOne({
            where: { id },
            relations: ['board']
        })
        
        if (!list) {
            throw new NotFoundException('List not found')
        }
        
        return list
    }
    
}
