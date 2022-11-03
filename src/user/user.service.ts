import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { compare, hash } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { Repository } from 'typeorm'
import { BoardService } from '../board/board.service'
import { CardEntity } from '../card/card.entity'
import { CommentEntity } from '../comment/comment.entity'
import { JWT_SECRET } from '../config'
import { ChangeEmailDto } from './dto/change-email.dto'
import { ChangeNameDto } from './dto/change-name.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { LoginUserDto } from './dto/login-user.dto'
import { RegistrationUserDto } from './dto/registration-user.dto'
import { ChangeEmailResponseInterface } from './types/change-email-response.interface'
import { ChangeNameResponseInterface } from './types/change-name-response.interface'
import { UserResponseInterface } from './types/user-response.interface'
import { UserEntity } from './user.entity'

@Injectable()
export class UserService {
    
    constructor(
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
        @InjectRepository(CardEntity) private cardRepository: Repository<CardEntity>,
        @InjectRepository(CommentEntity) private commentRepository: Repository<CommentEntity>,
        private boardService: BoardService
    ) {
    }
    
    async registration(registrationUserDto: RegistrationUserDto): Promise<UserEntity> {
        const userByEmail = await this.userRepository.findOne({
            where: { email: registrationUserDto.email }
        })
        
        if (userByEmail) {
            throw new BadRequestException('User with this email already exist')
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
            throw new BadRequestException('Wrong email or password')
        }
        
        const isPasswordCorrect = await compare(
            loginUserDto.password,
            user.password
        )
        
        if (!isPasswordCorrect) {
            throw new BadRequestException('Wrong email or password')
        }
        
        return user
    }
    
    generateJwt(user: UserEntity): string {
        return sign({ id: user.id }, JWT_SECRET)
    }
    
    async getUserById(id: number, throwErrorIfUserNotFound: boolean = true): Promise<UserEntity> {
        const user = await this.userRepository.findOne({ where: { id } })
        
        if (!user && throwErrorIfUserNotFound) {
            throw new NotFoundException('User not found')
        }
        
        return user
    }
    
    createUserResponse(user: UserEntity): UserResponseInterface {
        delete user.password
        return { ...user, token: this.generateJwt(user) }
    }
    
    async getUserByEmail(email: string): Promise<UserEntity> {
        const user = await this.userRepository.findOne({ where: { email } })
        
        if (!user) {
            throw new NotFoundException('User not found')
        }
        
        return user
    }
    
    async removeAllUserTasksInBoard(userId: number, boardId: number): Promise<void> {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.tasks', 'task')
            .leftJoinAndSelect('task.executor', 'executor')
            .leftJoinAndSelect('task.board', 'board')
            .where('executor.id = :userId AND board.id = :boardId', { userId, boardId })
            .getOne()
        
        if (user?.tasks) {
            for (const task of user.tasks) {
                task.executor = null
                await this.cardRepository.save(task)
            }
        }
    }
    
    async removeAllUserCommentsInBoard(userId: number, boardId: number): Promise<void> {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.comments', 'comment')
            .leftJoinAndSelect('comment.card', 'card')
            .leftJoinAndSelect('card.board', 'board')
            .where('user.id = :userId AND board.id = :boardId', { userId, boardId })
            .getOne()
        
        if (user?.comments) {
            for (const comment of user.comments) {
                await this.commentRepository.remove(comment)
            }
        }
    }
    
    async changeName(
        changeNameDto: ChangeNameDto,
        currentUser: UserEntity
    ): Promise<ChangeNameResponseInterface> {
        const user = { ...currentUser, ...changeNameDto }
        await this.userRepository.save(user)
        
        return { name: user.name }
    }
    
    async changeEmail(
        changeEmailDto: ChangeEmailDto,
        currentUser: UserEntity
    ): Promise<ChangeEmailResponseInterface> {
        const userByEmail = await this.userRepository.findOne({
            where: { email: changeEmailDto.email }
        })
        
        if (userByEmail) {
            throw new BadRequestException('User with this email already exists')
        }
        
        const user = { ...currentUser, ...changeEmailDto }
        await this.userRepository.save(user)
        
        return { email: user.email }
    }
    
    async changePassword(
        changePasswordDto: ChangePasswordDto,
        currentUserId: number
    ): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: currentUserId },
            select: ['id', 'password']
        })
        
        const isCurrentPasswordCorrect = await compare(
            changePasswordDto.currentPassword,
            user.password
        )
        
        if (!isCurrentPasswordCorrect) {
            throw new BadRequestException('Current password is wrong')
        }
        
        user.password = await hash(changePasswordDto.newPassword, 10)
        await this.userRepository.save(user)
    }
    
    async deleteAccount(currentUserId: number): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: currentUserId },
            relations: ['adminBoards']
        })
        
        for (const board of user.adminBoards) {
            await this.boardService.removeAdmin(
                { userId: user.id, boardId: board.id },
                user.id
            )
        }
        
        await this.userRepository.remove(user)
    }
    
}
