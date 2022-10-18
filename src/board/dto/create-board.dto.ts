import { IsEnum, IsOptional, IsString } from 'class-validator'
import { getAvailableBoardColors } from '../helpers/get-available-board-colors'
import { BoardColorsEnum } from '../types/board-colors.enum'

export class CreateBoardDto {
    
    @IsString()
    name: string
    
    @IsOptional()
    @IsEnum(BoardColorsEnum, { message: `color must be one of ${getAvailableBoardColors()}` })
    color: BoardColorsEnum
    
}