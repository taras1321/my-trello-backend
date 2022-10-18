import { IsNumber } from 'class-validator'

export class MemberDto {
    
    @IsNumber()
    boardId: number
    
    @IsNumber()
    userId: number
    
}