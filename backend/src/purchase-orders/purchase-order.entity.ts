import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Material } from '../materials/material.entity';

@Entity()
export class PurchaseOrder {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  pedido: string;

  @Column({ type: 'varchar' })
  posPed: string;

  @Column({ type: 'varchar', nullable: true })
  solp: string;

  @Column({ type: 'varchar', nullable: true })
  posSolp: string;

  @Column({ type: 'varchar', nullable: true })
  centro: string;

  @Column({ type: 'varchar', nullable: true })
  descripcion: string;

  @Column({ type: 'double precision', nullable: true })
  qty: number;

  @Column({ type: 'double precision', nullable: true })
  saldo: number;

  @Column({ type: 'date', nullable: true })
  fechaEntrega: Date | null;

  @Column({ type: 'int', nullable: true })
  dias: number | null;

  @Column({ type: 'varchar', nullable: true })
  proveedor: string;

  @Column({ type: 'varchar', nullable: true })
  orden: string;

  @Column({ type: 'varchar', nullable: true })
  solicitante: string;

  @Column({ type: 'varchar', nullable: true })
  tipoMaterial: string;

  @Column({ type: 'date', nullable: true })
  fechaLiberacion: Date | null;

  @ManyToOne(() => Material, { nullable: true })
  material: Material | null;
}