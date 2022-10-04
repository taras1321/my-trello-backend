import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ListController } from './list.controller'
import { ListEntity } from './list.entity'
import { ListService } from './list.service'

@Module({
    imports: [TypeOrmModule.forFeature([ListEntity])],
    controllers: [ListController],
    providers: [ListService]
})
export class ListModule {
}
