import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { Repository } from 'typeorm'
import { JWT_SECRET } from '../config'
import { LoginUserDto } from './dto/login-user.dto'
import { RegistrationUserDto } from './dto/registration-user.dto'
import { UserResponseType } from './types/user-response.type'
import { UserEntity } from './user.entity'

@Injectable()
export class UserService {
    
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>
    ) {
    }
    
    async registration(registrationUserDto: RegistrationUserDto): Promise<UserEntity> {
        const userByEmail = await this.userRepository.findOne({
            where: { email: registrationUserDto.email }
        })
        
        if (userByEmail) {
            throw new HttpException(
                'User with this email already exist',
                HttpStatus.BAD_REQUEST
            )
        }
        
        const newUser = this.userRepository.create(registrationUserDto)
        
        return this.userRepository.save(newUser)
    }
    
    async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
        const user = await this.userRepository.findOne({
            where: { email: loginUserDto.email },
            select: ['id', 'name', 'email', 'password']
        })
        
        if (!user) {
            throw new HttpException(
                'Wrong email or password',
                HttpStatus.BAD_REQUEST
            )
        }
        
        const isPasswordCorrect = await compare(
            loginUserDto.password,
            user.password
        )
        
        if (!isPasswordCorrect) {
            throw new HttpException(
                'Wrong email or password',
                HttpStatus.BAD_REQUEST
            )
        }
        
        return user
    }
    
    generateJwt(user: UserEntity): string {
        return sign({
            id: user.id,
            email: user.email
        }, JWT_SECRET)
    }
    
    createUserResponse(user: UserEntity): UserResponseType {
        delete user.password
        
        return {
            ...user,
            token: this.generateJwt(user)
        }
    }
    
}
