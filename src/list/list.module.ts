import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BoardEntity } from '../board/board.entity'
import { BoardService } from '../board/board.service'
import { UserEntity } from '../user/user.entity'
import { UserService } from '../user/user.service'
import { ListController } from './list.controller'
import { ListEntity } from './list.entity'
import { ListService } from './list.service'

@Module({
    imports: [TypeOrmModule.forFeature([ListEntity, BoardEntity, UserEntity])],
    controllers: [ListController],
    providers: [ListService, BoardService, UserService]
})
export class ListModule {
}
