import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { CardEntity } from '../card/card.entity'
import { UserEntity } from '../user/user.entity'

@Entity({ name: 'comment' })
export class CommentEntity {
    
    @PrimaryGeneratedColumn()
    id: number
    
    @Column()
    name: string
    
    @CreateDateColumn()
    createdDate: Date
    
    @ManyToOne(
        () => CardEntity,
        card => card.comments,
        { nullable: false, onDelete: 'CASCADE' }
    )
    card: CardEntity
    
    @ManyToOne(
        () => UserEntity,
        user => user.comments,
        { nullable: false }
    )
    user: UserEntity
    
}