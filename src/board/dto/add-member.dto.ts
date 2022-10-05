import { IsNotEmpty, IsNumber } from 'class-validator'

export class AddMemberDto {
    
    @IsNumber()
    @IsNotEmpty()
    boardId: number
    
    @IsNumber()
    @IsNotEmpty()
    userId: number
    
}