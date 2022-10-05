import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from '../user/user.entity'
import { UserService } from '../user/user.service'
import { BoardController } from './board.controller'
import { BoardEntity } from './board.entity'
import { BoardService } from './board.service'

@Module({
    imports: [TypeOrmModule.forFeature([BoardEntity, UserEntity])],
    controllers: [BoardController],
    providers: [BoardService, UserService]
})
export class BoardModule {
}
