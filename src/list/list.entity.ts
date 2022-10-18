import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { BoardEntity } from '../board/board.entity'
import { CardEntity } from '../card/card.entity'

@Entity({ name: 'list' })
export class ListEntity {
    
    @PrimaryGeneratedColumn()
    id: number
    
    @Column()
    name: string
    
    @ManyToOne(
        () => BoardEntity,
        board => board.lists,
        { nullable: false, onDelete: 'CASCADE' }
    )
    board: BoardEntity
    
    @OneToMany(() => CardEntity, card => card.list)
    cards: CardEntity[]
    
}