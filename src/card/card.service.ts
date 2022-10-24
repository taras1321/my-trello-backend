import {
    ForbiddenException, forwardRef, Inject, Injectable, NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BoardEntity } from '../board/board.entity'
import { BoardService } from '../board/board.service'
import { ListService } from '../list/list.service'
import { UserService } from '../user/user.service'
import { CardEntity } from './card.entity'
import { ChangeCardDto } from './dto/change-card.dto'
import { CreateCardDto } from './dto/create-card.dto'
import { SetExecutorDto } from './dto/set-executor.dto'
import { ChangeCardResponseType } from './types/change-card-response.type'
import { GetFullCardResponseType } from './types/get-full-card-response.type'

@Injectable()
export class CardService {
    
    constructor(
        @InjectRepository(CardEntity) private cardRepository: Repository<CardEntity>,
        @InjectRepository(BoardEntity) private boardRepository: Repository<BoardEntity>,
        @Inject(forwardRef(() => BoardService))
        private boardService: BoardService,
        @Inject(forwardRef(() => ListService))
        private listService: ListService,
        private userService: UserService
    ) {
    }
    
    async create(createCardDto: CreateCardDto, currentUserId: number): Promise<CardEntity> {
        const list = await this.listService.getListById(createCardDto.listId)
        const board = await this.boardService.getBoardByIdAndCheckAccess(
            list.board.id,
            currentUserId
        )
        
        if (!this.boardService.isUserAdmin(currentUserId, board)) {
            throw new ForbiddenException('You are not an admin of this board')
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
    
    async getCardById(id: number, relations: string[] = []): Promise<CardEntity> {
        const card = await this.cardRepository.findOne({
            where: { id },
            relations
        })
        
        if (!card) {
            throw new NotFoundException('Card not found')
        }
        
        return card
    }
    
    async getFullCardById(cardId: number, currentUserId: number): Promise<GetFullCardResponseType> {
        const card = await this.cardRepository
            .createQueryBuilder('card')
            .leftJoinAndSelect('card.executor', 'executor')
            .leftJoinAndSelect('card.board', 'board')
            .leftJoinAndSelect('card.comments', 'comments')
            .leftJoinAndSelect('board.admins', 'admins')
            .leftJoinAndSelect('board.members', 'members')
            .where('card.id = :id', { id: cardId })
            .select([
                'card.id', 'card.name', 'card.description', 'card.executor',
                'comments', 'board.id', 'admins.id', 'admins.name', 'members.id', 'members.name',
                'executor.id', 'executor.name'
            ])
            .getOne()
        
        if (!card) {
            throw new NotFoundException('card not found')
        }
        
        this.boardService.checkUserAccessToBoard(card.board, currentUserId)
        const isCurrentUserAdmin = this.boardService.isUserAdmin(currentUserId, card.board)
        
        return {
            ...card,
            isCurrentUserAdmin,
            currentUserId
        }
    }
    
    async setExecutor(setExecutorDto: SetExecutorDto, currentUserId: number): Promise<void> {
        const card = await this.cardRepository.findOne(
            {
                where: { id: setExecutorDto.cardId },
                relations: ['executor', 'board'],
                select: ['executor', 'id', 'board']
            }
        )
        
        await this.boardService.checkUserAccessToBoard(card.board, currentUserId)
        
        if (setExecutorDto.userId) {
            await this.boardService.checkUserAccessToBoard(card.board, setExecutorDto.userId)
            card.executor = await this.userService.getUserById(setExecutorDto.userId)
        } else {
            card.executor = null
        }
        
        await this.cardRepository.save(card)
    }
    
    async changeCard(
        changeCardDto: ChangeCardDto,
        currentUserId: number,
        cardId: number
    ): Promise<ChangeCardResponseType> {
        let card = await this.getCardById(cardId, ['board'])
        
        if (!this.boardService.isUserAdmin(currentUserId, card.board)) {
            throw new ForbiddenException('You are not an admin of this board')
        }
        
        card = { ...card, ...changeCardDto }
        await this.cardRepository.save(card)
        
        return {
            id: card.id,
            name: card.name,
            description: card.description
        }
    }
    
    async deleteCard(currentUserId: number, cardId: number): Promise<void> {
        const card = await this.getCardById(cardId, ['board'])
        const board = await this.boardService.getBoardByIdAndCheckAccess(
            card.board.id,
            currentUserId
        )
        
        if (!this.boardService.isUserAdmin(currentUserId, card.board)) {
            throw new ForbiddenException('You are not an admin of this board')
        }
        
        board.order.forEach(list => {
            list.cardsIds = list.cardsIds.filter(id => id !== card.id)
        })
        
        await this.boardRepository.save(board)
        await this.cardRepository.remove(card)
    }
    
}
