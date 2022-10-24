import { Body, Controller, Delete, Param, Post, Put, UseGuards } from '@nestjs/common'
import { User } from '../user/decorators/user.decorator'
import { AuthGuard } from '../user/guards/auth-guard'
import { ChangeListDto } from './dto/change-list.dto'
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
    
    @Put(':id')
    @UseGuards(AuthGuard)
    changeList(
        @Body() changeListDto: ChangeListDto,
        @User('id') currentUserId: number,
        @Param('id') listId: number,
    ): Promise<ListEntity> {
        return this.listService.changeList(changeListDto, currentUserId, listId)
    }
    
    @Delete(':id')
    @UseGuards(AuthGuard)
    deleteList(
        @User('id') currentUserId: number,
        @Param('id') listId: number,
    ): Promise<void> {
        return this.listService.deleteList(currentUserId, listId)
    }
    
}
