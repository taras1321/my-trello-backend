import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BoardModule } from '../board/board.module'
import { CardModule } from '../card/card.module'
import { CommentController } from './comment.controller'
import { CommentEntity } from './comment.entity'
import { CommentService } from './comment.service'

@Module({
    imports: [
        TypeOrmModule.forFeature([CommentEntity]),
        CardModule,
        BoardModule
    ],
    providers: [CommentService],
    controllers: [CommentController]
})
export class CommentModule {
}
