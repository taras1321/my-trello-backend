import {
    BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CardEntity } from '../card/card.entity'
import { CardService } from '../card/card.service'
import { ListService } from '../list/list.service'
import { UserEntity } from '../user/user.entity'
import { UserService } from '../user/user.service'
import { BoardEntity } from './board.entity'
import { ChangeBoardDto } from './dto/change-board.dto'
import { ChangeOrderDto } from './dto/change-order.dto'
import { CreateBoardDto } from './dto/create-board.dto'
import { MemberDto } from './dto/member.dto'
import { BoardWithListsAndCardsInterface } from './types/board-with-lists-and-cards.interface'
import { ChangeBoardType } from './types/change-board.type'
import { CommentsCountByUserInterface } from './types/comments-count-by-user.interface'
import { CreateBoardResponseInterface } from './types/create-board-response.interface'
import { GetBoardsInterface } from './types/get-boards.interface'
import { GetMembersInterface } from './types/get-members.interface'
import { ToggleFavoriteInterface } from './types/toggle-favorite.interface'

@Injectable()
export class BoardService {
    
    constructor(
        @InjectRepository(BoardEntity) private boardRepository: Repository<BoardEntity>,
        @InjectRepository(CardEntity) private cardRepository: Repository<CardEntity>,
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
        @Inject(forwardRef(() => ListService))
        private listService: ListService,
        @Inject(forwardRef(() => CardService))
        private cardService: CardService
    ) {
    }
    
    async create(
        createBoardDto: CreateBoardDto,
        currentUser: UserEntity
    ): Promise<CreateBoardResponseInterface> {
        const newBoard = this.boardRepository.create(createBoardDto)
        newBoard.admins = [currentUser]
        await this.boardRepository.save(newBoard)
        
        return { id: newBoard.id }
    }
    
    async getBoardByIdAndCheckAccess(
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
        
        this.checkUserAccessToBoard(board, userId)
        return board
    }
    
    async addMember(addMemberDto: MemberDto, currentUserId: number): Promise<void> {
        const board = await this.getBoardByIdAndCheckAccess(addMemberDto.boardId, currentUserId)
        
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
        const board = await this.getBoardByIdAndCheckAccess(removeMemberDto.boardId, currentUserId)
        const isCurrentUserRemovingUser = currentUserId === removeMemberDto.userId
        
        if (!(isCurrentUserRemovingUser || this.isUserAdmin(currentUserId, board))) {
            throw new ForbiddenException('You do not have access to remove members')
        }
        
        if (!this.isUserMember(removeMemberDto.userId, board)) {
            throw new BadRequestException('User is not a member of this board')
        }
        
        await this.userService.removeAllUserTasksInBoard(
            removeMemberDto.userId,
            removeMemberDto.boardId
        )
        await this.userService.removeAllUserCommentsInBoard(
            removeMemberDto.userId,
            removeMemberDto.boardId
        )
        board.members = board.members.filter(member => member.id !== removeMemberDto.userId)
        await this.boardRepository.save(board)
        
        return
    }
    
    async addAdmin(addAdminDto: MemberDto, currentUserId: number): Promise<void> {
        const board = await this.getBoardByIdAndCheckAccess(addAdminDto.boardId, currentUserId)
        
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
        const board = await this.getBoardByIdAndCheckAccess(removeAdminDto.boardId, currentUserId)
        
        if (!this.isUserAdmin(currentUserId, board)) {
            throw new ForbiddenException('You do not have access to remove admins')
        }
        
        board.admins = board.admins.filter(admin => admin.id !== removeAdminDto.userId)
        
        if (board.admins.length === 0) {
            await this.boardRepository.remove(board)
            return
        }
        
        await this.userService.removeAllUserTasksInBoard(
            removeAdminDto.userId,
            removeAdminDto.boardId
        )
        await this.userService.removeAllUserCommentsInBoard(
            removeAdminDto.userId,
            removeAdminDto.boardId
        )
        
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
    
    checkUserAccessToBoard(board: BoardEntity, userId: number): void {
        if (this.isUserAdmin(userId, board) || this.isUserMember(userId, board)) {
            return
        }
        
        throw new ForbiddenException('You do not have access to this board')
    }
    
    async getBoardWithListsAndCards(
        boardId: number,
        userId: number
    ): Promise<BoardWithListsAndCardsInterface> {
        const board = await this.boardRepository
            .createQueryBuilder('board')
            .leftJoinAndSelect('board.lists', 'list')
            .leftJoinAndSelect('board.cards', 'card')
            .leftJoinAndSelect('board.admins', 'admin')
            .leftJoinAndSelect('board.members', 'member')
            .leftJoinAndSelect('board.likedUsers', 'likedUsers')
            .leftJoinAndSelect('card.comments', 'comment')
            .leftJoinAndSelect('comment.user', 'commentAuthor')
            .leftJoinAndSelect('card.executor', 'executor')
            .where('board.id = :id', { id: boardId })
            .getOne()
        
        if (!board) {
            throw new NotFoundException('Board not found')
        }
        
        this.checkUserAccessToBoard(board, userId)
        const boardListIds = board.lists.map(list => list.id)
        const boardCardIds = board.cards.map(card => card.id)
        
        board.order.forEach(item => {
            const listId = item.listId
            
            if (!boardListIds.includes(listId)) {
                board.order = board.order.filter(item => item.listId !== listId)
            }
            
            item.cardsIds.forEach(cardId => {
                if (!boardCardIds.includes(cardId)) {
                    item.cardsIds = item.cardsIds.filter(id => id !== cardId)
                }
            })
        })
        
        let isLikedByCurrentUser = false
        
        if (board.likedUsers.map(user => user.id).includes(userId)) {
            isLikedByCurrentUser = true
        }
        
        await this.boardRepository.save(board)
        
        return {
            id: board.id,
            name: board.name,
            color: board.color,
            isCurrentUserAdmin: this.isUserAdmin(userId, board),
            liked: isLikedByCurrentUser,
            lists: board.order.map(item => {
                const list = board.lists.find(list => list.id === item.listId)
                
                const cards = item.cardsIds.map(cardId => {
                    const card = board.cards.find(card => card.id === cardId)
                    const commentsCountByUser: CommentsCountByUserInterface[] = []
                    
                    card.comments.forEach(comment => {
                        const user = commentsCountByUser
                            .find(user => user.userId === comment.user.id)
                        
                        if (user) {
                            user.commentsCount++
                        } else {
                            commentsCountByUser.push({ userId: comment.user.id, commentsCount: 1 })
                        }
                    })
                    
                    return {
                        id: card.id,
                        name: card.name,
                        hasExecutor: !!card.executor,
                        executorId: card.executor ? card.executor.id : null,
                        commentsCount: card.comments.length,
                        commentsCountByUser
                    }
                })
                
                return { id: list.id, name: list.name, cards }
            })
        }
    }
    
    async toggleFavorite(
        boardId: number,
        currentUser: UserEntity
    ): Promise<ToggleFavoriteInterface> {
        const board = await this.getBoardByIdAndCheckAccess(boardId, currentUser.id, ['likedUsers'])
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
        const board = await this.getBoardByIdAndCheckAccess(boardId, currentUser.id)
        
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
    
    async changeOrder(changeOrderDto: ChangeOrderDto, currentUserId: number): Promise<void> {
        const board = await this.getBoardByIdAndCheckAccess(
            changeOrderDto.boardId,
            currentUserId,
            ['lists', 'cards']
        )
        
        const list = await this.listService.getListById(changeOrderDto.newListId)
        const card = await this.cardService.getCardById(changeOrderDto.cardId)
        const boardListIds = board.lists.map(list => list.id)
        const boardCardIds = board.cards.map(card => card.id)
        
        if (!boardListIds.includes(list.id)) {
            throw new BadRequestException('This board do not have this list')
        }
        
        if (!boardCardIds.includes(card.id)) {
            throw new BadRequestException('This board do not have this card')
        }
        
        card.list = list
        
        board.order.forEach(list => {
            list.cardsIds = list.cardsIds
                .filter(id => (boardCardIds.includes(id) && id !== changeOrderDto.cardId))
        })
        
        const listFromOrder = board.order.find(list => list.listId === changeOrderDto.newListId)
        listFromOrder.cardsIds.splice(changeOrderDto.newCardPosition, 0, card.id)
        
        await this.cardRepository.save(card)
        await this.boardRepository.save(board)
    }
    
    async changeBoard(
        boardId: number,
        userId: number,
        changeBoardDto: ChangeBoardDto
    ): Promise<ChangeBoardType> {
        let board = await this.getBoardByIdAndCheckAccess(boardId, userId)
        board = { ...board, ...changeBoardDto }
        await this.boardRepository.save(board)
        
        return {
            id: board.id,
            name: board.name,
            color: board.color
        }
    }
    
    async deleteBoard(boardId: number, userId: number): Promise<void> {
        const board = await this.getBoardByIdAndCheckAccess(boardId, userId)
        
        if (this.isUserAdmin(userId, board)) {
            await this.boardRepository.remove(board)
            return
        }
        
        throw new ForbiddenException('You do not have access to delete this board')
    }
    
}
