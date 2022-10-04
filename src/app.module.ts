import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ormConfig } from './orm-config'
import { AuthMiddleware } from './user/middlewares/auth.middleware'
import { UserModule } from './user/user.module'
import { BoardModule } from './board/board.module';
import { ListModule } from './list/list.module';
import { CardModule } from './card/card.module';
import { CommentModule } from './comment/comment.module';

@Module({
    imports: [
        TypeOrmModule.forRoot(ormConfig),
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
