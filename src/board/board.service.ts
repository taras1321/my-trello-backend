import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
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
    
    async addMember(addMemberDto: AddMemberDto, currentUserId: number): Promise<BoardEntity> {
        const board = await this.boardRepository.findOne({
            where: { id: addMemberDto.boardId },
            relations: ['admins', 'members']
        })
        
        const adminsIds = [...board.admins.map(admin => admin.id)]
        const membersIds = [...board.members.map(member => member.id)]
        
        if (!adminsIds.includes(currentUserId)) {
            throw new ForbiddenException('You do not have access to add members')
        }
        
        if (membersIds.includes(addMemberDto.userId)) {
            throw new BadRequestException('User with this id already is member')
        }
        
        if (adminsIds.includes(addMemberDto.userId)) {
            board.admins = board.admins.filter(admin => admin.id !== addMemberDto.userId)
        }
        
        const newMember = await this.userService.getUserById(addMemberDto.userId)
        board.members.push(newMember)
        
        return this.boardRepository.save(board)
    }
    
    async addAdmin(addAdminDto: AddMemberDto, currentUserId: number): Promise<BoardEntity> {
        const board = await this.boardRepository.findOne({
            where: { id: addAdminDto.boardId },
            relations: ['admins', 'members']
        })
        
        const adminsIds = [...board.admins.map(admin => admin.id)]
        const membersIds = [...board.members.map(member => member.id)]
        
        if (!adminsIds.includes(currentUserId)) {
            throw new ForbiddenException('You do not have access to add members')
        }
        
        if (adminsIds.includes(addAdminDto.userId)) {
            throw new BadRequestException('User with this id already is admin')
        }
        
        if (membersIds.includes(addAdminDto.userId)) {
            board.members = board.members.filter(member => member.id !== addAdminDto.userId)
        }
        
        const newAdmin = await this.userService.getUserById(addAdminDto.userId)
        board.admins.push(newAdmin)
        
        return this.boardRepository.save(board)
    }
    
}
