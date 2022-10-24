import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BoardService } from '../board/board.service'
import { CardService } from '../card/card.service'
import { UserEntity } from '../user/user.entity'
import { CommentEntity } from './comment.entity'
import { CreateCommentDto } from './dto/create-comment.dto'
import { CreateCommentResponseInterface } from './types/create-comment-response.interface'

@Injectable()
export class CommentService {
    
    constructor(
        @InjectRepository(CommentEntity) private commentRepository: Repository<CommentEntity>,
        private cardService: CardService,
        private boardService: BoardService
    ) {
    }
    
    async create(
        createCommentDto: CreateCommentDto,
        currentUser: UserEntity
    ): Promise<CreateCommentResponseInterface> {
        const card = await this.cardService.getCardById(createCommentDto.cardId, ['board'])
        this.boardService.checkUserAccessToBoard(card.board, currentUser.id)
        
        const newComment = this.commentRepository.create({
            text: createCommentDto.text,
            user: currentUser,
            card
        })
        
        await this.commentRepository.save(newComment)
        
        return {
            id: newComment.id,
            text: newComment.text,
            createdDate: newComment.createdDate,
            user: {
                id: newComment.user.id,
                name: newComment.user.name
            }
        }
    }
    
    async deleteComment(commentId: number, currentUserId: number): Promise<void> {
        const comment = await this.commentRepository
            .createQueryBuilder('comment')
            .leftJoinAndSelect('comment.user', 'user')
            .leftJoinAndSelect('comment.card', 'card')
            .leftJoinAndSelect('card.board', 'board')
            .leftJoinAndSelect('board.admins', 'admins')
            .where('comment.id = :id', { id: commentId })
            .getOne()
        
        if (!comment) {
            throw new NotFoundException('Comment not found')
        }
        
        const isCurrentUserAdmin = this.boardService.isUserAdmin(currentUserId, comment.card.board)
        const isCurrentUsersComment = comment.user.id === currentUserId
        
        if (isCurrentUsersComment || isCurrentUserAdmin) {
            await this.commentRepository.remove(comment)
            return
        }
        
        throw new ForbiddenException('You do not have access to delete this comment')
    }
    
}
