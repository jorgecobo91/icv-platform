import * as dotenv from 'dotenv';
dotenv.config();

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';



import { Material } from './materials/material.entity';
import { Stock } from './stock/stock.entity';
import { PurchaseOrder } from './purchase-orders/purchase-order.entity';

import { MaterialsModule } from './materials/materials.module';
import { StockModule } from './stock/stock.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL
        ? { rejectUnauthorized: false }
        : false,
      entities: [Material, Stock, PurchaseOrder],
      synchronize: true,
    }),
    MaterialsModule,
    StockModule,
    PurchaseOrdersModule,
  ],
  
})
export class AppModule {}