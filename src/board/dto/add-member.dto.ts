import { IsNumber } from 'class-validator'

export class AddMemberDto {
    
    @IsNumber()
    boardId: number
    
    @IsNumber()
    userId: number
    
}