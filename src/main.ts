import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { BackendValidationPipe } from './pipes/backend-validation.pipe'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    app.useGlobalPipes(new BackendValidationPipe())
    await app.listen(3000)
}

bootstrap()
