import { Public } from '@/decorator/public.decorator';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('category')
@ApiTags('Category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Public()
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto.name, dto.parentId);
  }

  @Public()
  @Get('tree')
  getTree() {
    return this.categoryService.getTree();
  }

  @Public()
  @Get(':id/children')
  getChildren(@Param('id') id: number) {
    return this.categoryService.getChildren(id);
  }

  @Public()
  @Get(':id/parents')
  getParent(@Param('id') id: number) {
    return this.categoryService.getParent(id);
  }

  @Public()
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @Public()
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.delete(id);
  }
}
