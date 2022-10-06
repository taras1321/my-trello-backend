import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BoardEntity } from '../board/board.entity'
import { BoardService } from '../board/board.service'
import { ListEntity } from '../list/list.entity'
import { ListService } from '../list/list.service'
import { UserEntity } from '../user/user.entity'
import { UserService } from '../user/user.service'
import { CardController } from './card.controller'
import { CardEntity } from './card.entity'
import { CardService } from './card.service'

@Module({
    imports: [TypeOrmModule.forFeature([CardEntity, BoardEntity, UserEntity, ListEntity])],
    controllers: [CardController],
    providers: [CardService, BoardService, UserService, ListService]
})
export class CardModule {
}
