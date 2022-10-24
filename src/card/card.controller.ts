import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { User } from '../user/decorators/user.decorator'
import { AuthGuard } from '../user/guards/auth-guard'
import { CardEntity } from './card.entity'
import { CardService } from './card.service'
import { ChangeCardDto } from './dto/change-card.dto'
import { CreateCardDto } from './dto/create-card.dto'
import { SetExecutorDto } from './dto/set-executor.dto'
import { ChangeCardResponseType } from './types/change-card-response.type'
import { GetFullCardResponseType } from './types/get-full-card-response.type'

@Controller('card')
export class CardController {
    
    constructor(private cardService: CardService) {
    }
    
    @Post()
    @UseGuards(AuthGuard)
    async create(
        @Body() createCardDto: CreateCardDto,
        @User('id') currentUserId: number
    ): Promise<CardEntity> {
        return this.cardService.create(createCardDto, currentUserId)
    }
    
    @Get(':id')
    @UseGuards(AuthGuard)
    async getCardById(
        @Param('id') cardId: number,
        @User('id') currentUserId: number
    ): Promise<GetFullCardResponseType> {
        return this.cardService.getFullCardById(cardId, currentUserId)
    }
    
    @Post('set-executor')
    @UseGuards(AuthGuard)
    async setExecutor(
        @User('id') currentUserId: number,
        @Body() setExecutorDto: SetExecutorDto
    ): Promise<void> {
        return this.cardService.setExecutor(setExecutorDto, currentUserId)
    }
    
    @Put(':id')
    @UseGuards(AuthGuard)
    async changeCard(
        @Param('id') cardId: number,
        @User('id') currentUserId: number,
        @Body() changeCardDto: ChangeCardDto
    ): Promise<ChangeCardResponseType> {
        return this.cardService.changeCard(changeCardDto, currentUserId, cardId)
    }
    
    @Delete(':id')
    @UseGuards(AuthGuard)
    async deleteCard(
        @Param('id') cardId: number,
        @User('id') currentUserId: number,
    ): Promise<void> {
        return this.cardService.deleteCard(currentUserId, cardId)
    }
    
}
