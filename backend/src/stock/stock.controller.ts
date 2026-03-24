import {
  Controller,
  Post,
  Get,
  Param,
  Headers,
  UnauthorizedException,
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

  @Get('cruzados')
  async getAlmacenesCruzados() {
    return this.stockService.obtenerAlmacenesCruzados();
  }

  @Get('material/:codigo')
  async getStockByMaterial(
    @Param('codigo') codigo: string,
    @Headers('x-api-key') apiKey: string,
  ) {
    if (apiKey !== process.env.API_KEY) {
      throw new UnauthorizedException('API Key inválida');
    }
    return this.stockService.getStockByMaterial(codigo);
  }

}