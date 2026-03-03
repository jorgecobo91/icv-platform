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
    private purchaseOrdersRepository: Repository<PurchaseOrder>,
  ) {}

  async getMaterialFull(codigo: string) {

    // 1️⃣ Buscar material exacto
    let material = await this.materialRepository.findOne({
      where: { codigo },
    });

    // 2️⃣ Buscar por similitud si no existe exacto
    if (!material) {
      material = await this.materialRepository
        .createQueryBuilder('m')
        .where('m.codigo ILIKE :codigo', { codigo: `%${codigo}%` })
        .orWhere('m.descripcion ILIKE :codigo', { codigo: `%${codigo}%` })
        .getOne();
    }

    if (!material) {
      return { message: 'Material no encontrado' };
    }

    // 3️⃣ Obtener stock relacionado
    const stock = await this.stockRepository.find({
      where: { material: { id: material.id } },
      relations: ['material'],
    });

    const totalDisponible = stock.reduce(
      (sum, s) => sum + Number(s.stockDisponible || 0),
      0,
    );

    // 4️⃣ Obtener órdenes de compra relacionadas
    const ordenes = await this.purchaseOrdersRepository.find({
      where: { material: { id: material.id } },
      relations: ['material'],
    });

    const hoy = new Date();

    const ordenesProcesadas = ordenes.map((oc) => {

      let diasAtraso = 0;
      let estado = 'SIN_FECHA';

      if (oc.fechaEntrega) {
        const fechaEntrega = new Date(oc.fechaEntrega);
        const diffTime = hoy.getTime() - fechaEntrega.getTime();
        diasAtraso = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        estado = diasAtraso > 0 ? 'ATRASADO' : 'EN_FECHA';
      }

      return {
        numeroOC: oc.pedido,
        posicionPedido: oc.posPed,
        solped: oc.solp,
        cantidadPedida: oc.qty,
        cantidadPendiente: oc.saldo,
        fechaEntrega: oc.fechaEntrega,
        proveedor: oc.proveedor,
        ordenInterna: oc.orden,
        solicitante: oc.solicitante,
        tipoMaterial: oc.tipoMaterial,
        fechaLiberacion: oc.fechaLiberacion,
        diasAtraso: diasAtraso > 0 ? diasAtraso : 0,
        estado,
      };
    });

    return {
      material: {
        codigo: material.codigo,
        descripcion: material.descripcion,
        centro: material.centro,
      },
      stock,
      resumenStock: {
        totalDisponible,
        tieneStock: totalDisponible > 0,
      },
      ordenesCompra: ordenesProcesadas,
      resumenOC: {
        tieneOrdenes: ordenesProcesadas.length > 0,
        hayAtraso: ordenesProcesadas.some(
          (o) => o.estado === 'ATRASADO',
        ),
      },
    };
  }
}