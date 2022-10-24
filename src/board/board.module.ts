import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CardEntity } from '../card/card.entity'
import { CardModule } from '../card/card.module'
import { ListModule } from '../list/list.module'
import { UserModule } from '../user/user.module'
import { BoardController } from './board.controller'
import { BoardEntity } from './board.entity'
import { BoardService } from './board.service'

@Module({
    imports: [
        TypeOrmModule.forFeature([BoardEntity, CardEntity]),
        UserModule,
        ListModule,
        CardModule
    ],
    controllers: [BoardController],
    providers: [BoardService],
    exports: [BoardService]
})
export class BoardModule {
}
