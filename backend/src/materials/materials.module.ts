import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './material.entity';
import { Stock } from '../stock/stock.entity';
import { PurchaseOrder } from '../purchase-orders/purchase-order.entity';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Material,
      Stock,
      PurchaseOrder,
    ]),
  ],
  controllers: [MaterialsController],
  providers: [MaterialsService],
})
export class MaterialsModule {}