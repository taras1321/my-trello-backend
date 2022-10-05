import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'

export class BackendValidationPipe implements PipeTransform {
    
    async transform(value: any, metadata: ArgumentMetadata) {
        const object = plainToInstance(metadata.metatype, value)
        
        if (typeof object !== 'object') {
            return value
        }
        
        const errors = await validate(object)
        
        if (errors.length === 0) {
            return value
        }
        
        throw new BadRequestException({ errors: this.formatError(errors) })
    }
    
    formatError(errors: ValidationError[]) {
        return errors.reduce((acc, err) => {
            acc[err.property] = Object.values(err.constraints)
            return acc
        }, {})
    }
    
}