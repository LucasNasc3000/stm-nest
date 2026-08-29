import { Type } from 'class-transformer';
import { Action, Resource } from 'src/common/enums/permissions.enum';
import {
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Role } from './role.entity';

@Entity()
@Unique(['action', 'resource'])
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: Action })
  action: Action;

  @Column({ type: 'enum', enum: Resource })
  resource: Resource;

  @ManyToMany(() => Role, (role) => role.permissions)
  @Type(() => Role)
  roles: Role[];
}
