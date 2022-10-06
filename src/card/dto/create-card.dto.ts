import { IsNumber, IsString } from 'class-validator'

export class CreateCardDto {
    
    @IsString()
    name: string
    
    @IsNumber()
    listId: number
    
}