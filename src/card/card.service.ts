import { ForbiddenException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BoardEntity } from '../board/board.entity'
import { BoardService } from '../board/board.service'
import { ListService } from '../list/list.service'
import { CardEntity } from './card.entity'
import { CreateCardDto } from './dto/create-card.dto'

@Injectable()
export class CardService {
    
    constructor(
        @InjectRepository(CardEntity) private cardRepository: Repository<CardEntity>,
        @InjectRepository(BoardEntity) private boardRepository: Repository<BoardEntity>,
        private boardService: BoardService,
        private listService: ListService
    ) {
    }
    
    async create(createCardDto: CreateCardDto, currentUserId: number): Promise<CardEntity> {
        const list = await this.listService.getListById(createCardDto.listId)
        const board = await this.boardService.getBoardById(list.board.id, currentUserId)
        
        if (!this.boardService.isUserAdmin(currentUserId, board)) {
            throw new ForbiddenException('You are not a admin of this board')
        }
        
        const newCard = this.cardRepository.create({
            name: createCardDto.name,
            list,
            board
        })
        
        await this.cardRepository.save(newCard)
        
        const orderList = board.order.find(list => list.listId === createCardDto.listId)
        orderList.cardsIds.push(newCard.id)
        await this.boardRepository.save(board)
        
        delete newCard.board
        delete newCard.list
        
        return newCard
    }
    
}
