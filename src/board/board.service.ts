import {
    BadRequestException, ForbiddenException, Injectable, NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from '../user/user.entity'
import { UserService } from '../user/user.service'
import { BoardEntity } from './board.entity'
import { CreateBoardDto } from './dto/create-board.dto'
import { MemberDto } from './dto/member.dto'
import { GetBoardsInterface } from './types/get-boards.interface'
import { GetMembersInterface } from './types/get-members.interface'
import { ToggleFavoriteInterface } from './types/toggle-favorite.interface'

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
    
    async addMember(addMemberDto: MemberDto, currentUserId: number): Promise<void> {
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
    
        await this.boardRepository.save(board)
        return
    }
    
    async removeMember(removeMemberDto: MemberDto, currentUserId: number): Promise<void> {
        const board = await this.getBoardById(removeMemberDto.boardId, currentUserId)
        const isCurrentUserRemovingUser = currentUserId === removeMemberDto.userId
        
        if (!(isCurrentUserRemovingUser || this.isUserAdmin(currentUserId, board))) {
            throw new ForbiddenException('You do not have access to remove members')
        }
        
        if (!this.isUserMember(removeMemberDto.userId, board)) {
            throw new BadRequestException('User is not a member of this board')
        }
        
        board.members = board.members.filter(member => member.id !== removeMemberDto.userId)
        await this.boardRepository.save(board)
        
        return
    }
    
    async addAdmin(addAdminDto: MemberDto, currentUserId: number): Promise<void> {
        const board = await this.getBoardById(addAdminDto.boardId, currentUserId)
        
        if (!this.isUserAdmin(currentUserId, board)) {
            throw new ForbiddenException('You do not have access to add members')
        }
        
        if (this.isUserAdmin(addAdminDto.userId, board)) {
            throw new BadRequestException('User with this id already is an admin')
        }
        
        if (this.isUserMember(addAdminDto.userId, board)) {
            board.members = board.members.filter(member => member.id !== addAdminDto.userId)
        }
        
        const newAdmin = await this.userService.getUserById(addAdminDto.userId)
        board.admins.push(newAdmin)
        
        await this.boardRepository.save(board)
        return
    }
    
    async removeAdmin(removeAdminDto: MemberDto, currentUserId: number): Promise<void> {
        const board = await this.getBoardById(removeAdminDto.boardId, currentUserId)
        
        if (!this.isUserAdmin(currentUserId, board)) {
            throw new ForbiddenException('You do not have access to remove admins')
        }
        
        board.admins = board.admins.filter(admin => admin.id !== removeAdminDto.userId)
        
        if (board.admins.length === 0) {
            await this.boardRepository.remove(board)
            return
        }
        
        await this.boardRepository.save(board)
        return
    }
    
    isUserAdmin(userId: number, board: BoardEntity): boolean {
        return board.admins.map(admin => admin.id).includes(userId)
    }
    
    isUserMember(userId: number, board: BoardEntity): boolean {
        return board.members.map(member => member.id).includes(userId)
    }
    
    async getBoards(
        currentUserId: number,
        orderBy?: string,
        onlyFavoriteBoard: boolean = false,
        searchString?: string,
        limit?: string,
        offset?: string
    ): Promise<GetBoardsInterface> {
        const orderByFiled = orderBy === 'name' ? 'board.name' : 'board.createdDate'
        const order = orderBy === 'name' ? 'ASC' : 'DESC'
        
        const firstQueryBuilder = this.boardRepository
            .createQueryBuilder('board')
            .leftJoinAndSelect('board.admins', 'admin')
            .leftJoinAndSelect('board.members', 'member')
            .leftJoinAndSelect('board.likedUsers', 'likedUsers')
            .andWhere('(admin.id = :id OR member.id = :id)', { id: currentUserId })
            .select('board.id')
            .orderBy(orderByFiled, order)
            .groupBy('board.id')
        
        if (onlyFavoriteBoard) {
            firstQueryBuilder.andWhere('likedUsers.id = :id', { id: currentUserId })
        }
        
        if (searchString) {
            firstQueryBuilder.andWhere(
                'LOWER(board.name) LIKE LOWER(:search)',
                { search: `%${searchString}%` }
            )
        }
        
        const boardsCount = await firstQueryBuilder.getCount()
        
        if (limit) {
            firstQueryBuilder.limit(+limit)
        }
        
        if (offset) {
            firstQueryBuilder.offset(+offset)
        }
        
        const boardsIds = await firstQueryBuilder.getMany()
        const ids = boardsIds.map(board => board.id)
        
        const secondQueryBuilder = await this.boardRepository
            .createQueryBuilder('board')
            .leftJoinAndSelect('board.admins', 'admin')
            .leftJoinAndSelect('board.members', 'member')
            .leftJoinAndSelect('board.likedUsers', 'likedUsers')
            .orderBy(orderByFiled, order)
            .where('board.id IN (:...ids)', { ids })
        
        if (ids.length > 0) {
            secondQueryBuilder.where('board.id IN (:...ids)', { ids })
        } else {
            secondQueryBuilder.where('1 = 0')
        }
        
        const boards = await secondQueryBuilder.getMany()
        
        return {
            boardsCount,
            boards: boards.map(board => {
                const likedUsersIds = board.likedUsers.map(user => user.id)
                
                return {
                    id: board.id,
                    name: board.name,
                    color: board.color,
                    membersCount: board.members.length + board.admins.length,
                    liked: likedUsersIds.includes(currentUserId)
                }
            })
        }
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
    
    async toggleFavorite(
        boardId: number,
        currentUser: UserEntity
    ): Promise<ToggleFavoriteInterface> {
        const board = await this.getBoardById(boardId, currentUser.id, ['likedUsers'])
        const likedUserIds = board.likedUsers.map(user => user.id)
        
        if (likedUserIds.includes(currentUser.id)) {
            board.likedUsers = board.likedUsers.filter(user => user.id !== currentUser.id)
        } else {
            board.likedUsers.push(currentUser)
        }
        
        await this.boardRepository.save(board)
        return { liked: board.likedUsers.includes(currentUser) }
    }
    
    async getMembers(boardId: number, currentUser: UserEntity): Promise<GetMembersInterface> {
        const board = await this.getBoardById(boardId, currentUser.id)
        
        const adminsIds = board.admins.map(user => user.id)
        const isCurrentUserAdmin = adminsIds.includes(currentUser.id)
        
        return {
            boardName: board.name,
            currentUser: { ...currentUser, isAdmin: isCurrentUserAdmin },
            members: [
                ...board.admins
                    .filter(admin => admin.id !== currentUser.id)
                    .map(admin => ({ ...admin, isAdmin: true })),
                ...board.members
                    .filter(member => member.id !== currentUser.id)
                    .map(member => ({ ...member, isAdmin: false }))
            ]
        }
    }
    
}
