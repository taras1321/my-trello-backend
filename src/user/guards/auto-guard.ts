import {
    CanActivate, ExecutionContext, Injectable, UnauthorizedException
} from '@nestjs/common'

@Injectable()
export class AutoGuard implements CanActivate {
    
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest()
        
        if (request.user) {
            return true
        }
        
        throw new UnauthorizedException('User is not authorized')
    }
    
}