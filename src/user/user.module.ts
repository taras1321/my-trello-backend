import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CardEntity } from '../card/card.entity'
import { CommentEntity } from '../comment/comment.entity'
import { UserController } from './user.controller'
import { UserEntity } from './user.entity'
import { UserService } from './user.service'

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, CardEntity, CommentEntity])],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {
}
