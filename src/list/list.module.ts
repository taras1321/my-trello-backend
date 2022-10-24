import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BoardEntity } from '../board/board.entity'
import { BoardModule } from '../board/board.module'
import { UserModule } from '../user/user.module'
import { ListController } from './list.controller'
import { ListEntity } from './list.entity'
import { ListService } from './list.service'

@Module({
    imports: [
        TypeOrmModule.forFeature([ListEntity, BoardEntity]),
        forwardRef(() => BoardModule),
        UserModule
    ],
    controllers: [ListController],
    providers: [ListService],
    exports: [ListService]
})
export class ListModule {
}
