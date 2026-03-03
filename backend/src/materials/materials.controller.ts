import { Controller, Get, Param } from '@nestjs/common';
import { MaterialsService } from './materials.service';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get(':codigo/full')
  getMaterialFull(@Param('codigo') codigo: string) {
    return this.materialsService.getMaterialFull(codigo);
  }

  @Get(':codigo/telegram')
  getMaterialTelegram(@Param('codigo') codigo: string) {
    return this.materialsService.getMaterialTelegram(codigo);
  }
}