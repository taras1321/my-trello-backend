import {
    ForbiddenException, forwardRef, Inject, Injectable, NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BoardEntity } from '../board/board.entity'
import { BoardService } from '../board/board.service'
import { ChangeListDto } from './dto/change-list.dto'
import { CreateListDto } from './dto/create-list.dto'
import { ListEntity } from './list.entity'

@Injectable()
export class ListService {
    
    constructor(
        @InjectRepository(ListEntity) private listRepository: Repository<ListEntity>,
        @InjectRepository(BoardEntity) private boardRepository: Repository<BoardEntity>,
        @Inject(forwardRef(() => BoardService))
        private boardService: BoardService
    ) {
    }
    
    async creatList(createListDto: CreateListDto, currentUserId: number): Promise<ListEntity> {
        const board = await this.boardService.getBoardByIdAndCheckAccess(
            createListDto.boardId,
            currentUserId
        )
        
        if (!this.boardService.isUserAdmin(currentUserId, board)) {
            throw new ForbiddenException('You do not have access to create lists')
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
    
    async changeList(
        changeListDto: ChangeListDto,
        currentUserId: number,
        listId: number
    ): Promise<ListEntity> {
        let list = await this.getListById(listId)
        const board = await this.boardService.getBoardByIdAndCheckAccess(
            list.board.id,
            currentUserId
        )
        
        if (!this.boardService.isUserAdmin(currentUserId, board)) {
            throw new ForbiddenException('You do not have access to change list')
        }
        
        list = { ...list, ...changeListDto }
        await this.listRepository.save(list)
        delete list.board
        
        return list
    }
    
    async deleteList(currentUserId: number, listId: number): Promise<void> {
        const list = await this.getListById(listId)
        const board = await this.boardService.getBoardByIdAndCheckAccess(
            list.board.id,
            currentUserId
        )
        
        if (!this.boardService.isUserAdmin(currentUserId, board)) {
            throw new ForbiddenException('You do not have access to delete list')
        }
        
        board.order = board.order.filter(item => item.listId !== list.id)
        await this.boardRepository.save(board)
        await this.listRepository.remove(list)
    }
    
}
