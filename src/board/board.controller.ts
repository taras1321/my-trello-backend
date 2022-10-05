import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { User } from '../user/decorators/user.decorator'
import { AutoGuard } from '../user/guards/auto-guard'
import { UserEntity } from '../user/user.entity'
import { BoardEntity } from './board.entity'
import { BoardService } from './board.service'
import { AddMemberDto } from './dto/add-member.dto'
import { CreateBoardDto } from './dto/create-board.dto'

@Controller('board')
export class BoardController {
    
    constructor(private boardService: BoardService) {
    }
    
    @Post('create')
    @UseGuards(AutoGuard)
    async create(
        @User() currentUser: UserEntity,
        @Body() createBoardDto: CreateBoardDto
    ): Promise<BoardEntity> {
        return this.boardService.create(createBoardDto, currentUser)
    }
    
    @Post('add-member')
    @UseGuards(AutoGuard)
    async addMember(
        @User('id') currentUserId: number,
        @Body() addMemberDto: AddMemberDto
    ): Promise<BoardEntity> {
        return this.boardService.addMember(addMemberDto, currentUserId)
    }
    
    @Post('add-admin')
    @UseGuards(AutoGuard)
    async addAdmin(
        @User('id') currentUserId: number,
        @Body() addAdminDto: AddMemberDto
    ): Promise<BoardEntity> {
        return this.boardService.addAdmin(addAdminDto, currentUserId)
    }
    
}
