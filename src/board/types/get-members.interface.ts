import { UserEntity } from '../../user/user.entity'

export interface GetMembersInterface {
    currentUser: Omit<UserEntity, 'hashPassword'> & { isAdmin: boolean }
    members: (Omit<UserEntity, 'hashPassword'> & { isAdmin: boolean })[]
    boardName: string
}