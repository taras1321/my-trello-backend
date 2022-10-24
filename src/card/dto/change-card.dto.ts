import { IsOptional, IsString } from 'class-validator'

export class ChangeCardDto {
    
    @IsOptional()
    @IsString()
    name: string
    
    @IsOptional()
    @IsString()
    description: string
    
}