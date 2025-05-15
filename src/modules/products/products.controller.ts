/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
@ApiTags('Product')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'images', maxCount: 5 }, // upload nhiều ảnh
      ],
      {
        storage: diskStorage({
          destination: './uploads/products', // thư mục lưu ảnh
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
          },
        }),
      },
    ),
  )
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
    },
  ) {
    const imagePaths = files?.images?.map((file) => `/uploads/products/${file.filename}`);
    return this.productsService.create({
      ...createProductDto,
      images: imagePaths || [],
    });
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
