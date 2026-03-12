import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Stock } from './stock.entity';
import { Material } from '../materials/material.entity';

import { StockService } from './stock.service';
import { StockController } from './stock.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stock, Material]),
  ],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],   // ← ESTA LINE ES LA CLAVE
})
export class StockModule {}