import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { User } from '../user/decorators/user.decorator'
import { AuthGuard } from '../user/guards/auth-guard'
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
    @UseGuards(AuthGuard)
    async create(
        @User() currentUser: UserEntity,
        @Body() createBoardDto: CreateBoardDto
    ): Promise<BoardEntity> {
        return this.boardService.create(createBoardDto, currentUser)
    }
    
    @Get()
    @UseGuards(AuthGuard)
    async getBoards(@User('id') userId: number): Promise<BoardEntity[]> {
        return this.boardService.getBoards(userId)
    }
    
    @Get(':id')
    @UseGuards(AuthGuard)
    async getBoardById(
        @Param('id') boardId: number,
        @User('id') userId: number
    ): Promise<any> {
        return this.boardService.getBoardWithListsAndCards(boardId, userId)
    }
    
    @Post('add-member')
    @UseGuards(AuthGuard)
    async addMember(
        @User('id') currentUserId: number,
        @Body() addMemberDto: AddMemberDto
    ): Promise<BoardEntity> {
        return this.boardService.addMember(addMemberDto, currentUserId)
    }
    
    @Post('add-admin')
    @UseGuards(AuthGuard)
    async addAdmin(
        @User('id') currentUserId: number,
        @Body() addAdminDto: AddMemberDto
    ): Promise<BoardEntity> {
        return this.boardService.addAdmin(addAdminDto, currentUserId)
    }
    
}
