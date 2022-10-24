import { IsNumber, Min } from 'class-validator'

export class ChangeOrderDto {
    
    @IsNumber()
    boardId: number
    
    @IsNumber()
    newListId: number
    
    @IsNumber()
    cardId: number
    
    @IsNumber()
    @Min(0)
    newCardPosition: number
    
}