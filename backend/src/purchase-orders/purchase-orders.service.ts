import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { PurchaseOrder } from './purchase-order.entity';
import { Material } from '../materials/material.entity';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepository: Repository<PurchaseOrder>,

    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
  ) {}

  async importOC(file: Express.Multer.File) {

    await this.purchaseOrderRepository.clear();

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data: any[] = XLSX.utils.sheet_to_json(sheet);

    for (const row of data) {

      const pedido = row['Pedido'];
      const posPed = row['Pos Ped'];

      if (!pedido || !posPed) continue;

      let material: Material | null = null;

      const codigoMaterial = row['Material'];

      if (codigoMaterial) {
        material = await this.materialRepository.findOne({
          where: { codigo: codigoMaterial },
        });

        if (!material) {
          material = new Material();
          material.codigo = codigoMaterial;
          material.descripcion = row['Descripcion'];
          material.centro = '0344';
          await this.materialRepository.save(material);
        }
      }

      const po = new PurchaseOrder();

      po.pedido = pedido;
      po.posPed = posPed;
      po.solp = row['Solp'];
      po.posSolp = row['Pos Solp'];
      po.centro = row['Centro'];
      po.descripcion = row['Descripcion'];
      po.qty = parseFloat(row['Qty']) || 0;
      po.saldo = parseFloat(row['Saldo']) || 0;
      po.fechaEntrega = row['Fecha Entrega'] ? new Date(row['Fecha Entrega']) : null;
      po.dias = row['Dias'] ? parseInt(row['Dias']) : null;
      po.proveedor = row['Proveedor'];
      po.orden = row['Orden'];
      po.solicitante = row['Solicitante'];
      po.tipoMaterial = row['Tipo Material'];
      po.fechaLiberacion = row['Fecha Liberacion'] ? new Date(row['Fecha Liberacion']) : null;
      po.material = material;

      await this.purchaseOrderRepository.save(po);
    }

    return {
      message: 'Órdenes de compra importadas correctamente (modo snapshot activo)',
      totalRegistros: data.length,
    };
  }
}