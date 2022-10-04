import {
    Column, CreateDateColumn, Entity, ManyToMany, OneToMany,
    PrimaryGeneratedColumn
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
    
    @Column({ type: 'simple-json', nullable: true })
    order: { list: number, cards: number[] }[]
    
    @ManyToMany(() => UserEntity, user => user.adminBoards)
    admins: UserEntity[]
    
    @ManyToMany(() => UserEntity, user => user.memberBoards)
    members: UserEntity[]
    
    @ManyToMany(() => UserEntity, user => user.favoriteBoards)
    likedUsers: UserEntity[]
    
    @OneToMany(() => ListEntity, list => list.board)
    lists: ListEntity[]
    
    @OneToMany(() => CardEntity, card => card.board)
    cards: CardEntity[]
    
}