import { IsEmail, IsString } from 'class-validator'

export class RegistrationUserDto {
    
    @IsString()
    name: string
    
    @IsEmail()
    email: string
    
    @IsString()
    password: string
    
}