import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { Role } from './role.entity';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  resource: string;

  @Column({ nullable: true })
  action: string;

  @Column({ default: false })
  isSystemPermission: boolean;

  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];

  @ManyToMany(() => Permission, permission => permission.children)
  @JoinTable({
    name: 'permission_hierarchy',
    joinColumn: { name: 'parent_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'child_id', referencedColumnName: 'id' },
  })
  children: Permission[];

  @ManyToMany(() => Permission, permission => permission.children)
  parents: Permission[];
}


