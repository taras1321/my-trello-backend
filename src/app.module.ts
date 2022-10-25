import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BoardModule } from './board/board.module'
import { CardModule } from './card/card.module'
import { CommentModule } from './comment/comment.module'
import { ListModule } from './list/list.module'
import { AuthMiddleware } from './user/middlewares/auth.middleware'
import { UserModule } from './user/user.module'

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            url: process.env.DATABASE_URL,
            type: 'postgres',
            ssl: {
                rejectUnauthorized: false,
            },
            entities: ['dist/**/*.entity{.ts,.js}'],
            autoLoadEntities: true,
            synchronize: true
        }),
        UserModule,
        BoardModule,
        ListModule,
        CardModule,
        CommentModule
    ]
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes({
            path: '*',
            method: RequestMethod.ALL
        })
    }
}
