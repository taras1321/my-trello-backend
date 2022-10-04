import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BoardController } from './board.controller'
import { BoardEntity } from './board.entity'
import { BoardService } from './board.service'

@Module({
    imports: [TypeOrmModule.forFeature([BoardEntity])],
    controllers: [BoardController],
    providers: [BoardService]
})
export class BoardModule {
}
