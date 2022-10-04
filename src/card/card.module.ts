import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CardController } from './card.controller'
import { CardEntity } from './card.entity'
import { CardService } from './card.service'

@Module({
    imports: [TypeOrmModule.forFeature([CardEntity])],
    controllers: [CardController],
    providers: [CardService]
})
export class CardModule {
}
