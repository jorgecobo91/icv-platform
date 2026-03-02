import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Stock } from '../stock/stock.entity';
import { PurchaseOrder } from '../purchase-orders/purchase-order.entity';

@Entity()
export class Material {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  codigo: string;

  @Column()
  descripcion: string;

  @Column()
  centro: string;

  @OneToMany(() => Stock, (stock) => stock.material)
  stocks: Stock[];

  @OneToMany(() => PurchaseOrder, (po) => po.material)
  purchaseOrders: PurchaseOrder[];
}