import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { User } from '../user/decorators/user.decorator'
import { AutoGuard } from '../user/guards/auto-guard'
import { UserEntity } from '../user/user.entity'
import { BoardEntity } from './board.entity'
import { BoardService } from './board.service'
import { CreateBoardDto } from './dto/create-board.dto'

@Controller('board')
export class BoardController {
    
    constructor(private boardService: BoardService) {
    }
    
    @Post()
    @UseGuards(AutoGuard)
    create(
        @User() currentUser: UserEntity,
        @Body() createBoardDto: CreateBoardDto
    ): Promise<BoardEntity> {
        return this.boardService.create(createBoardDto, currentUser)
    }

}
