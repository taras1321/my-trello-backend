import { CardEntity } from '../card.entity'

export type ChangeCardResponseType = Pick<CardEntity, 'id' | 'name' | 'description'>