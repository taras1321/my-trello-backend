import { hash } from 'bcrypt'
import {
    BeforeInsert, Column, Entity, JoinTable, ManyToMany, OneToMany,
    PrimaryGeneratedColumn
} from 'typeorm'
import { BoardEntity } from '../board/board.entity'
import { CardEntity } from '../card/card.entity'
import { CommentEntity } from '../comment/comment.entity'

@Entity({ name: 'user' })
export class UserEntity {
    
    @PrimaryGeneratedColumn()
    id: number
    
    @Column()
    name: string
    
    @Column()
    email: string
    
    @Column({ select: false })
    password: string
    
    @ManyToMany(() => BoardEntity, boards => boards.admins)
    @JoinTable()
    adminBoards: BoardEntity[]
    
    @ManyToMany(() => BoardEntity, boards => boards.members)
    @JoinTable()
    memberBoards: BoardEntity[]
    
    @ManyToMany(() => BoardEntity, boards => boards.likedUsers)
    @JoinTable()
    favoriteBoards: BoardEntity[]
    
    @OneToMany(() => CardEntity, card => card.executor)
    tasks: CardEntity[]
    
    @OneToMany(() => CommentEntity, comment => comment.user)
    comments: CommentEntity[]
    
    @BeforeInsert()
    async hashPassword() {
        this.password = await hash(this.password, 10)
    }
    
}