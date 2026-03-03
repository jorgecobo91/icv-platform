import { Controller, Get, Param } from '@nestjs/common';
import { MaterialsService } from './materials.service';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  findAll() {
    return this.materialsService.findAll();
  }

  @Get('status/:codigo')
  getMaterialStatus(@Param('codigo') codigo: string) {
    return this.materialsService.getMaterialStatus(codigo);
  }
}