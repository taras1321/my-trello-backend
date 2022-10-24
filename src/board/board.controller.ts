import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { User } from '../user/decorators/user.decorator'
import { AuthGuard } from '../user/guards/auth-guard'
import { UserEntity } from '../user/user.entity'
import { BoardService } from './board.service'
import { ChangeBoardDto } from './dto/change-board.dto'
import { ChangeOrderDto } from './dto/change-order.dto'
import { CreateBoardDto } from './dto/create-board.dto'
import { MemberDto } from './dto/member.dto'
import { BoardWithListsAndCardsInterface } from './types/board-with-lists-and-cards.interface'
import { ChangeBoardType } from './types/change-board.type'
import { CreateBoardResponseInterface } from './types/create-board-response.interface'
import { GetBoardsInterface } from './types/get-boards.interface'
import { GetMembersInterface } from './types/get-members.interface'
import { ToggleFavoriteInterface } from './types/toggle-favorite.interface'

@Controller('board')
export class BoardController {
    
    constructor(private boardService: BoardService) {
    }
    
    @Post('create')
    @UseGuards(AuthGuard)
    async create(
        @User() currentUser: UserEntity,
        @Body() createBoardDto: CreateBoardDto
    ): Promise<CreateBoardResponseInterface> {
        return this.boardService.create(createBoardDto, currentUser)
    }
    
    @Get()
    @UseGuards(AuthGuard)
    async getBoards(
        @User('id') currentUserId: number,
        @Query('order-by') orderBy?: string,
        @Query('favorite') favorite?: string,
        @Query('search') search?: string,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string
    ): Promise<GetBoardsInterface> {
        return this.boardService
            .getBoards(currentUserId, orderBy, !!favorite, search, limit, offset)
    }
    
    @Get(':id')
    @UseGuards(AuthGuard)
    async getBoardById(
        @Param('id') boardId: number,
        @User('id') userId: number
    ): Promise<BoardWithListsAndCardsInterface> {
        return this.boardService.getBoardWithListsAndCards(boardId, userId)
    }
    
    @Put(':id')
    @UseGuards(AuthGuard)
    async changeBoard(
        @Param('id') boardId: number,
        @User('id') userId: number,
        @Body() changeBoardDto: ChangeBoardDto
    ): Promise<ChangeBoardType> {
        return this.boardService.changeBoard(boardId, userId, changeBoardDto)
    }
    
    @Delete(':id')
    @UseGuards(AuthGuard)
    async deleteBoard(
        @Param('id') boardId: number,
        @User('id') userId: number
    ): Promise<void> {
        return this.boardService.deleteBoard(boardId, userId)
    }
    
    @Post('add-member')
    @UseGuards(AuthGuard)
    async addMember(
        @User('id') currentUserId: number,
        @Body() addMemberDto: MemberDto
    ): Promise<void> {
        return this.boardService.addMember(addMemberDto, currentUserId)
    }
    
    @Post('remove-member')
    @UseGuards(AuthGuard)
    async removeMember(
        @User('id') currentUserId: number,
        @Body() removeMemberDto: MemberDto
    ): Promise<void> {
        return this.boardService.removeMember(removeMemberDto, currentUserId)
    }
    
    @Post('add-admin')
    @UseGuards(AuthGuard)
    async addAdmin(
        @User('id') currentUserId: number,
        @Body() addAdminDto: MemberDto
    ): Promise<void> {
        return this.boardService.addAdmin(addAdminDto, currentUserId)
    }
    
    @Post('remove-admin')
    @UseGuards(AuthGuard)
    async removeAdmin(
        @User('id') currentUserId: number,
        @Body() removeAdminDto: MemberDto
    ): Promise<void> {
        return this.boardService.removeAdmin(removeAdminDto, currentUserId)
    }
    
    @Get('like/:boardId')
    @UseGuards(AuthGuard)
    async toggleFavorite(
        @User() currentUser: UserEntity,
        @Param('boardId') boardId: number
    ): Promise<ToggleFavoriteInterface> {
        return this.boardService.toggleFavorite(boardId, currentUser)
    }
    
    @Get('members/:boardId')
    @UseGuards(AuthGuard)
    async getMembers(
        @User() currentUser: UserEntity,
        @Param('boardId') boardId: number
    ): Promise<GetMembersInterface> {
        return this.boardService.getMembers(boardId, currentUser)
    }
    
    @Post('change-order')
    @UseGuards(AuthGuard)
    async changeOrder(
        @User('id') currentUserId: number,
        @Body() changeOrderDto: ChangeOrderDto
    ): Promise<void> {
        return this.boardService.changeOrder(changeOrderDto, currentUserId)
    }
    
}
