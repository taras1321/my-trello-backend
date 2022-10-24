import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { BackendValidationPipe } from './pipes/backend-validation.pipe'

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true })
    app.useGlobalPipes(new BackendValidationPipe())
    const PORT = process.env.PORT || 5000;
    await app.listen(PORT)
}

bootstrap()
