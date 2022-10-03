import {
    ArgumentMetadata, HttpException, HttpStatus, PipeTransform
} from '@nestjs/common'
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
    
        throw new HttpException(
            { errors: this.formatError(errors) },
            HttpStatus.BAD_REQUEST
        )
    }
    
    formatError(errors: ValidationError[]) {
        return errors.reduce((acc, err) => {
            acc[err.property] = Object.values(err.constraints)
            return acc
        }, {})
    }

}