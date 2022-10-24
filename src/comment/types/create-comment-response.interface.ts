export interface CreateCommentResponseInterface {
    id: number
    text: string
    createdDate: Date
    user: {
        id: number
        name: string
    }
}