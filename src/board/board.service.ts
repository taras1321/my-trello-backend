import {
    BadRequestException, ForbiddenException, Injectable, NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from '../user/user.entity'
import { UserService } from '../user/user.service'
import { BoardEntity } from './board.entity'
import { AddMemberDto } from './dto/add-member.dto'
import { CreateBoardDto } from './dto/create-board.dto'

@Injectable()
export class BoardService {
    
    constructor(
        @InjectRepository(BoardEntity) private boardRepository: Repository<BoardEntity>,
        private userService: UserService
    ) {
    }
    
    async create(createBoardDto: CreateBoardDto, currentUser: UserEntity): Promise<BoardEntity> {
        const newBoard = this.boardRepository.create(createBoardDto)
        newBoard.admins = [currentUser]
        
        return this.boardRepository.save(newBoard)
    }
    
    async getBoardById(
        boardId: number,
        userId: number,
        additionalRelations: string[] = []
    ): Promise<BoardEntity> {
        const board = await this.boardRepository.findOne({
            where: { id: boardId },
            relations: ['admins', 'members', ...additionalRelations]
        })
        
        if (!board) {
            throw new NotFoundException('Board not found')
        }
        
        if (this.isUserAdmin(userId, board) || this.isUserMember(userId, board)) {
            return board
        }
        
        throw new ForbiddenException('You do not have access to this board')
    }
    
    async addMember(addMemberDto: AddMemberDto, currentUserId: number): Promise<BoardEntity> {
        const board = await this.getBoardById(addMemberDto.boardId, currentUserId)
        
        if (!this.isUserAdmin(currentUserId, board)) {
            throw new ForbiddenException('You do not have access to add members')
        }
        
        if (this.isUserMember(addMemberDto.userId, board)) {
            throw new BadRequestException('User with this id already is member')
        }
        
        if (this.isUserAdmin(addMemberDto.userId, board)) {
            board.admins = board.admins.filter(admin => admin.id !== addMemberDto.userId)
        }
        
        const newMember = await this.userService.getUserById(addMemberDto.userId)
        board.members.push(newMember)
        
        return this.boardRepository.save(board)
    }
    
    async addAdmin(addAdminDto: AddMemberDto, currentUserId: number): Promise<BoardEntity> {
        const board = await this.getBoardById(addAdminDto.boardId, currentUserId)
        
        if (!this.isUserAdmin(currentUserId, board)) {
            throw new ForbiddenException('You do not have access to add members')
        }
        
        if (this.isUserAdmin(addAdminDto.userId, board)) {
            throw new BadRequestException('User with this id already is admin')
        }
        
        if (this.isUserMember(addAdminDto.userId, board)) {
            board.members = board.members.filter(member => member.id !== addAdminDto.userId)
        }
        
        const newAdmin = await this.userService.getUserById(addAdminDto.userId)
        board.admins.push(newAdmin)
        
        return this.boardRepository.save(board)
    }
    
    isUserAdmin(userId: number, board: BoardEntity): boolean {
        return board.admins.map(admin => admin.id).includes(userId)
    }
    
    isUserMember(userId: number, board: BoardEntity): boolean {
        return board.members.map(member => member.id).includes(userId)
    }
    
    async getBoards(userId: number): Promise<BoardEntity[]> {
        const boardsIds = await this.boardRepository
            .createQueryBuilder('board')
            .leftJoinAndSelect('board.admins', 'admin')
            .leftJoinAndSelect('board.members', 'member')
            .andWhere('admin.id = :id OR member.id = :id', { id: userId })
            .select('board.id')
            .orderBy('board.createdDate', 'DESC')
            .getMany()
        
        const ids = boardsIds.map(board => board.id)
        
        const boards = this.boardRepository
            .createQueryBuilder('board')
            .leftJoinAndSelect('board.admins', 'admin')
            .leftJoinAndSelect('board.members', 'member')
            .where('board.id IN (:...ids)', { ids })
            .orderBy('board.createdDate', 'DESC')
        
        return boards.getMany()
    }
    
    async getBoardWithListsAndCards(boardId: number, userId: number): Promise<BoardEntity> {
        const board = await this.getBoardById(boardId, userId, ['lists', 'cards'])
        
        const fullBoard = {
            ...board,
            lists: board.order.map(item => {
                const list = board.lists.find(list => list.id === item.listId)
                list.cards = board.cards.filter(card => item.cardsIds.includes(card.id))
                
                return list
            })
        }
        
        delete fullBoard.order
        delete fullBoard.cards
        
        return fullBoard
    }
    
}
