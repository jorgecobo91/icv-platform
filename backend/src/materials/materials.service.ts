import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './material.entity';
import { Stock } from '../stock/stock.entity';
import { PurchaseOrder } from '../purchase-orders/purchase-order.entity';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,

    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,

    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepository: Repository<PurchaseOrder>,
  ) {}

  async findAll() {
    return this.materialRepository.find();
  }

  async getMaterialStatus(codigo: string) {
    const material = await this.materialRepository.findOne({
      where: { codigo },
    });

    if (!material) {
      return { mensaje: `Material ${codigo} no encontrado.` };
    }

    // STOCK
    const stockRecords = await this.stockRepository.find({
      where: { material: { id: material.id } },
    });

    const totalStock = stockRecords.reduce(
      (sum, s) => sum + (s.stockDisponible || 0),
      0,
    );

    // OC
    const ocRecords = await this.purchaseOrderRepository.find({
      where: { material: { id: material.id } },
    });

    const ocAbiertas = ocRecords.filter((po) => (po.saldo || 0) > 0);

    const totalPendiente = ocAbiertas.reduce(
      (sum, po) => sum + (po.saldo || 0),
      0,
    );

    let mensaje = `📦 MATERIAL: ${material.codigo}\n`;
    mensaje += `📝 Descripción: ${material.descripcion}\n\n`;

    // -------- STOCK INFO --------
    if (totalStock > 0) {
      mensaje += `📊 STOCK TOTAL: ${totalStock}\n`;
      mensaje += `Detalle:\n`;

      stockRecords.forEach((s) => {
        mensaje += `- Alm: ${s.almacen} | Ubicación: ${s.ubicacion} | Lote: ${s.lote} | Tipo: ${s.tipo} | Cant: ${s.stockDisponible}\n`;
      });

      mensaje += `\n`;
    } else {
      mensaje += `⚠ SIN STOCK DISPONIBLE\n\n`;
    }

    // -------- OC INFO --------
    if (ocAbiertas.length > 0) {
      mensaje += `📑 ÓRDENES DE COMPRA ABIERTAS: ${ocAbiertas.length}\n`;
      mensaje += `Cantidad pendiente total: ${totalPendiente}\n\n`;

      ocAbiertas.forEach((po) => {
        mensaje += `- OC: ${po.pedido}\n`;
        mensaje += `  Pos: ${po.posPed}\n`;
        mensaje += `  Saldo: ${po.saldo}\n`;
        mensaje += `  Fecha Entrega: ${po.fechaEntrega || 'Sin info'}\n`;
        mensaje += `  Días atraso: ${po.dias ?? 'Sin info'}\n`;
        mensaje += `  Proveedor: ${po.proveedor || 'Sin info'}\n`;
        mensaje += `  OM: ${po.orden || 'Sin info'}\n`;
        mensaje += `  Solicitante: ${po.solicitante || 'Sin info'}\n\n`;
      });
    } else {
      mensaje += `📑 SIN ÓRDENES DE COMPRA ASOCIADAS\n`;
    }

    if (totalStock === 0 && ocAbiertas.length === 0) {
      mensaje = `⚠ MATERIAL ${codigo} SIN STOCK Y SIN ÓRDENES DE COMPRA ASOCIADAS`;
    }

    return {
      codigo: material.codigo,
      descripcion: material.descripcion,
      stockTotal: totalStock,
      ordenesAbiertas: ocAbiertas.length,
      cantidadPendiente: totalPendiente,
      mensaje,
    };
  }
}