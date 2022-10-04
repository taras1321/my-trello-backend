import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from '../user/user.entity'
import { BoardEntity } from './board.entity'
import { CreateBoardDto } from './dto/create-board.dto'

@Injectable()
export class BoardService {
    
    constructor(
        @InjectRepository(BoardEntity)
        private boardRepository: Repository<BoardEntity>
    ) {
    }
    
    async create(
        createBoardDto: CreateBoardDto,
        currentUser: UserEntity
    ): Promise<BoardEntity> {
        const newBoard = this.boardRepository.create(createBoardDto)
        newBoard.admins = [currentUser]
        
        return this.boardRepository.save(newBoard)
    }
    
}
