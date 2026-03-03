import {
    Controller,
    Post,
    Get,
    UseInterceptors,
    UploadedFile,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { StockService } from './stock.service';
  
  @Controller('stock')
export class StockController {

  constructor(private readonly stockService: StockService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importStock(@UploadedFile() file: Express.Multer.File) {
    return this.stockService.importStock(file);
  }

  @Get()
  async getAllStock() {
    return this.stockService.getAllStock();
  }
}