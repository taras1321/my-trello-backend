import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common'
import { User } from '../user/decorators/user.decorator'
import { AuthGuard } from '../user/guards/auth-guard'
import { UserEntity } from '../user/user.entity'
import { CommentService } from './comment.service'
import { CreateCommentDto } from './dto/create-comment.dto'
import { CreateCommentResponseInterface } from './types/create-comment-response.interface'

@Controller('comment')
export class CommentController {
    
    constructor(private commentService: CommentService) {
    }
    
    @Post()
    @UseGuards(AuthGuard)
    create(
        @User() currentUser: UserEntity,
        @Body() createCommentDto: CreateCommentDto
    ): Promise<CreateCommentResponseInterface> {
        return this.commentService.create(createCommentDto, currentUser)
    }
    
    @Delete(':id')
    @UseGuards(AuthGuard)
    deleteComment(
        @Param('id') commentId: number,
        @User('id') currentUserId: number
    ): Promise<void> {
        return this.commentService.deleteComment(commentId, currentUserId)
    }
    
}
