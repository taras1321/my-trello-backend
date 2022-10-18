import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { User } from './decorators/user.decorator'
import { LoginUserDto } from './dto/login-user.dto'
import { RegistrationUserDto } from './dto/registration-user.dto'
import { UserEmailDto } from './dto/user-email.dto'
import { AuthGuard } from './guards/auth-guard'
import { UserResponseInterface } from './types/user-response.interface'
import { UserEntity } from './user.entity'
import { UserService } from './user.service'

@Controller()
export class UserController {
    
    constructor(private userService: UserService) {
    }
    
    @Post('registration')
    async registration(
        @Body() registrationUserDto: RegistrationUserDto
    ): Promise<UserResponseInterface> {
        const user = await this.userService.registration(registrationUserDto)
        return this.userService.createUserResponse(user)
    }
    
    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto): Promise<UserResponseInterface> {
        const user = await this.userService.login(loginUserDto)
        return this.userService.createUserResponse(user)
    }
    
    @Get('user')
    @UseGuards(AuthGuard)
    async getUser(@User() currentUser: UserEntity): Promise<UserEntity> {
        return currentUser
    }
    
    @Post('user/by-email')
    @UseGuards(AuthGuard)
    async getUserByEmail(@Body() userEmailDto: UserEmailDto): Promise<UserEntity> {
        return this.userService.getUserByEmail(userEmailDto.email)
    }
    
}
