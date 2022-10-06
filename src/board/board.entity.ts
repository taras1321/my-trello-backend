import {
    Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn
} from 'typeorm'
import { CardEntity } from '../card/card.entity'
import { ListEntity } from '../list/list.entity'
import { UserEntity } from '../user/user.entity'

@Entity({ name: 'board' })
export class BoardEntity {
    
    @PrimaryGeneratedColumn()
    id: number
    
    @Column()
    name: string
    
    @CreateDateColumn()
    createdDate: Date
    
    @Column({ type: 'simple-json', default: [] })
    order: { listId: number, cardsIds: number[] }[]
    
    @ManyToMany(
        () => UserEntity,
        user => user.adminBoards,
        { eager: true }
    )
    admins: UserEntity[]
    
    @ManyToMany(
        () => UserEntity,
        user => user.memberBoards,
        { eager: true }
    )
    members: UserEntity[]
    
    @ManyToMany(() => UserEntity, user => user.favoriteBoards)
    likedUsers: UserEntity[]
    
    @OneToMany(() => ListEntity, list => list.board)
    lists: ListEntity[]
    
    @OneToMany(() => CardEntity, card => card.board)
    cards: CardEntity[]
    
}