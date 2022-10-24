import { IsNumber, ValidateIf } from 'class-validator'

export class SetExecutorDto {
    
    @IsNumber()
    @ValidateIf((object, value) => value !== null)
    userId: number | null
    
    @IsNumber()
    cardId: number
    
}