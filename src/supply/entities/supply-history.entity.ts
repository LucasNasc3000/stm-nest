import { Column, Entity } from 'typeorm';
import { SupplyRealTime } from './supply-realtime.entity';

@Entity({ name: 'supply_history' })
export class SupplyHistory extends SupplyRealTime {
  @Column({ type: 'varchar', length: 50 })
  reason: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    name: 'total_weight_per_register',
  })
  totalWeightPerRegister: string;
}
