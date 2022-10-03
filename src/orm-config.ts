import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export const ormConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'root',
    database: 'my-trello-db',
    autoLoadEntities: true,
    synchronize: true
}