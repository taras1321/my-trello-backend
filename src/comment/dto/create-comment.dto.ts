import { IsNumber, IsString } from 'class-validator'

export class CreateCommentDto {
    
    @IsString()
    text: string
    
    @IsNumber()
    cardId: number
    
}