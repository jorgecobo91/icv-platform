import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { PurchaseOrdersService } from './purchase-orders.service';
  
  @Controller('purchase-orders')
  export class PurchaseOrdersController {
    constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}
  
    @Post('import')
    @UseInterceptors(FileInterceptor('file'))
    async importOC(@UploadedFile() file: Express.Multer.File) {
      return this.purchaseOrdersService.importOC(file);
    }
  }