import { Body, Controller, Delete, Get, Post, Put, UseGuards } from '@nestjs/common'
import { User } from './decorators/user.decorator'
import { ChangeEmailDto } from './dto/change-email.dto'
import { ChangeNameDto } from './dto/change-name.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { LoginUserDto } from './dto/login-user.dto'
import { RegistrationUserDto } from './dto/registration-user.dto'
import { UserEmailDto } from './dto/user-email.dto'
import { AuthGuard } from './guards/auth-guard'
import { ChangeEmailResponseInterface } from './types/change-email-response.interface'
import { ChangeNameResponseInterface } from './types/change-name-response.interface'
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
    
    @Put('change-name')
    @UseGuards(AuthGuard)
    async changeName(
        @Body() changeNameDto: ChangeNameDto,
        @User() currentUser: UserEntity
    ): Promise<ChangeNameResponseInterface> {
        return this.userService.changeName(changeNameDto, currentUser)
    }
    
    @Put('change-email')
    @UseGuards(AuthGuard)
    async changeEmail(
        @Body() changeEmailDto: ChangeEmailDto,
        @User() currentUser: UserEntity
    ): Promise<ChangeEmailResponseInterface> {
        return this.userService.changeEmail(changeEmailDto, currentUser)
    }
    
    @Put('change-password')
    @UseGuards(AuthGuard)
    async changePassword(
        @Body() changePasswordDto: ChangePasswordDto,
        @User('id') currentUserId: number
    ): Promise<void> {
        return this.userService.changePassword(changePasswordDto, currentUserId)
    }
    
    @Delete('delete-account')
    @UseGuards(AuthGuard)
    async deleteAccount(@User('id') currentUserId: number): Promise<any> {
        return this.userService.deleteAccount(currentUserId)
    }
    
}
