import { IsString } from 'class-validator'

export class ChangeListDto {
    
    @IsString()
    name: string
    
}