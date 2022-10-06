import { Body, Controller, Post } from '@nestjs/common'
import { User } from '../user/decorators/user.decorator'
import { CardEntity } from './card.entity'
import { CardService } from './card.service'
import { CreateCardDto } from './dto/create-card.dto'

@Controller('card')
export class CardController {
    
    constructor(private cardService: CardService) {
    }
    
    @Post()
    async creat(
        @Body() createCardDto: CreateCardDto,
        @User('id') currentUserId: number
    ): Promise<CardEntity> {
        return this.cardService.create(createCardDto, currentUserId)
    }
    
}
