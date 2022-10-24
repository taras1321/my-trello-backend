import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BoardEntity } from '../board/board.entity'
import { BoardModule } from '../board/board.module'
import { ListModule } from '../list/list.module'
import { UserModule } from '../user/user.module'
import { CardController } from './card.controller'
import { CardEntity } from './card.entity'
import { CardService } from './card.service'

@Module({
    imports: [
        TypeOrmModule.forFeature([CardEntity, BoardEntity]),
        forwardRef(() => BoardModule),
        ListModule,
        UserModule
    ],
    controllers: [CardController],
    providers: [CardService],
    exports: [CardService]
})
export class CardModule {
}
