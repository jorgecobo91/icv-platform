import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Stock } from './stock.entity';
import { Material } from '../materials/material.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,

    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
  ) {}
  async importStock(file: Express.Multer.File) {
    console.log('🔥 Iniciando importación de stock...');
  
    await this.stockRepository.clear();
    console.log('🧹 Stock anterior eliminado');
  
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data: any[] = XLSX.utils.sheet_to_json(sheet);
  
    console.log(`📄 Filas encontradas: ${data.length}`);
  
    let contador = 0;
  
    for (const row of data) {
  
      const codigoMaterial = row['Material'];
      const descripcion = row['Texto breve de material'];
      const ubicacion = row['Ubicación'];
      const almacen = row['Alm.'];
      const lote = row['Lote'];
      const tipo = row['Tp.'];
      const stockDisponible = parseFloat(row['St. disp.']) || 0;
  
      if (!codigoMaterial) continue;
  
      let material = await this.materialRepository.findOne({
        where: { codigo: codigoMaterial },
      });
  
      if (!material) {
        material = this.materialRepository.create({
          codigo: codigoMaterial,
          descripcion: descripcion,
          centro: '0344',
        });
  
        await this.materialRepository.save(material);
      }
  
      const stock = this.stockRepository.create({
        almacen,
        tipo,
        ubicacion,
        lote,
        stockDisponible,
        material,
      });
  
      await this.stockRepository.save(stock);
  
      contador++;
  
      if (contador % 200 === 0) {
        console.log(`⏳ Procesados: ${contador}`);
      }
    }
  
    console.log('✅ Importación finalizada');
  
    return {
      message: 'Stock importado correctamente (modo snapshot activo)',
      totalRegistros: data.length,
    };
  }
}