import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { User } from '../user/decorators/user.decorator'
import { AuthGuard } from '../user/guards/auth-guard'
import { CreateListDto } from './dto/create-list.dto'
import { ListEntity } from './list.entity'
import { ListService } from './list.service'

@Controller('list')
export class ListController {
    
    constructor(private listService: ListService) {
    }
    
    @Post()
    @UseGuards(AuthGuard)
    createList(
        @Body() createListDto: CreateListDto,
        @User('id') currentUserId: number
    ): Promise<ListEntity> {
        return this.listService.creatList(createListDto, currentUserId)
    }
    
}
