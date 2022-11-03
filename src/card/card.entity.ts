import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { BoardEntity } from '../board/board.entity'
import { CommentEntity } from '../comment/comment.entity'
import { ListEntity } from '../list/list.entity'
import { UserEntity } from '../user/user.entity'

@Entity({ name: 'card' })
export class CardEntity {
    
    @PrimaryGeneratedColumn()
    id: number
    
    @Column()
    name: string
    
    @Column({ nullable: true })
    description: string
    
    @ManyToOne(
        () => UserEntity,
        user => user.tasks,
        { onDelete: 'SET NULL' }
    )
    executor: UserEntity
    
    @ManyToOne(
        () => BoardEntity,
        board => board.cards,
        { nullable: false, onDelete: 'CASCADE' }
    )
    board: BoardEntity
    
    @ManyToOne(
        () => ListEntity,
        list => list.cards,
        { nullable: false, onDelete: 'CASCADE' }
    )
    list: ListEntity
    
    @OneToMany(() => CommentEntity, comment => comment.card)
    comments: CommentEntity[]
    
}