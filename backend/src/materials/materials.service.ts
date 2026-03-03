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

    let material = await this.materialRepository.findOne({
      where: { codigo },
    });

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

    const stock = await this.stockRepository.find({
      where: { material: { id: material.id } },
      relations: ['material'],
    });

    const totalDisponible = stock.reduce(
      (sum, s) => sum + Number(s.stockDisponible || 0),
      0,
    );

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

  async getMaterialTelegram(codigo: string): Promise<{ mensaje: string }> {

    const data: any = await this.getMaterialFull(codigo);

    if (data.message) {
      return { mensaje: '❌ Material no encontrado' };
    }

    const material = data.material;
    const stock = data.stock;
    const ordenes = data.ordenesCompra;

    let mensaje = `📦 STOCK\n\n`;
    mensaje += `Material: ${material.codigo}\n`;
    mensaje += `Texto: ${material.descripcion}\n`;
    mensaje += `Centro: ${material.centro}\n\n`;

    if (stock.length > 0) {
      stock.forEach((s: any) => {
        mensaje += `Alm: ${s.almacen} | Ubicación: ${s.ubicacion}\n`;
        mensaje += `Disponible: ${s.stockDisponible}\n\n`;
      });
    } else {
      mensaje += `Sin stock disponible\n\n`;
    }

    if (ordenes.length > 0) {
      mensaje += `📄 ORDEN DE COMPRA ASOCIADA\n\n`;

      ordenes.forEach((oc: any) => {
        mensaje += `Orden de Compra: ${oc.numeroOC}\n`;
        mensaje += `Cantidad Pedida: ${oc.cantidadPedida}\n`;
        mensaje += `Cantidad Pendiente: ${oc.cantidadPendiente}\n`;
        mensaje += `Fecha Entrega: ${oc.fechaEntrega ?? 'No informada'}\n`;
        mensaje += `Proveedor: ${oc.proveedor ?? 'No informado'}\n`;

        if (oc.estado === 'ATRASADO') {
          mensaje += `⚠ PEDIDO ATRASADO ${oc.diasAtraso} días\n`;
        }

        mensaje += `\n`;
      });

    } else {
      mensaje += `Sin órdenes de compra asociadas\n`;
    }

    return { mensaje };
  }
}