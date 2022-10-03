import { Body, Controller, Post } from '@nestjs/common'
import { LoginUserDto } from './dto/login-user.dto'
import { RegistrationUserDto } from './dto/registration-user.dto'
import { UserResponseType } from './types/user-response.type'
import { UserService } from './user.service'

@Controller()
export class UserController {
    
    constructor(private userService: UserService) {
    }
    
    @Post('registration')
    async registration(
        @Body() registrationUserDto: RegistrationUserDto
    ): Promise<UserResponseType> {
        const user = await this.userService.registration(registrationUserDto)
        return this.userService.createUserResponse(user)
    }
    
    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto): Promise<UserResponseType> {
        const user = await this.userService.login(loginUserDto)
        return this.userService.createUserResponse(user)
    }
    
}
