import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BoardModule } from '../board/board.module'
import { CardEntity } from '../card/card.entity'
import { CommentEntity } from '../comment/comment.entity'
import { UserController } from './user.controller'
import { UserEntity } from './user.entity'
import { UserService } from './user.service'

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, CardEntity, CommentEntity]),
        forwardRef(() => BoardModule),
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {
}
