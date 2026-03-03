import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/role/entities/permission.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CreateRoleDTO } from './dto/create-role.dto';
import { UpdatePermissionDTO } from './dto/update-permission.dto';
import { UpdateRoleDTO } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private readonly logger: Logger,
    private dataSource: DataSource,
  ) {}

  async CreateRole(createRoleDTO: CreateRoleDTO) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const permissions: Permission[] = [];

      const createRole = queryRunner.manager.create(Role, createRoleDTO);

      const newRole = await queryRunner.manager.save(Role, createRole);

      for (const permission of createRoleDTO.permissions) {
        const permissionData = {
          action: permission.action,
          resource: permission.resource,
          role: newRole,
        };

        const createPermission = queryRunner.manager.create(
          Permission,
          permissionData,
        );

        permissions.push(createPermission);
      }

      const newPermissions = await queryRunner.manager.save(
        Permission,
        permissions,
      );

      await queryRunner.commitTransaction();

      return {
        role: newRole,
        rolePermissions: newPermissions,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(`Erro ao criar cargo: ${error.message}`);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Falha ao processar transação na criação de cargo',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async UpdateRole(id: string, updateRoleDTO?: UpdateRoleDTO) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const doesRoleReallyExists = await queryRunner.manager.findOne(Role, {
        where: {
          id,
        },
        relations: {
          permissions: true,
        },
      });

      if (!doesRoleReallyExists) {
        throw new NotFoundException('Cargo não encontrado');
      }

      for (const permission of doesRoleReallyExists.permissions) {
        const doesPermissionsReallyExists = await queryRunner.manager.find(
          Permission,
          {
            where: {
              id: permission.id,
            },
            lock: { mode: 'pessimistic_write' },
          },
        );

        if (!doesPermissionsReallyExists) {
          throw new NotFoundException('Uma ou mais permissões não encontradas');
        }

        const doesThisPermissionBelongsToThisRole =
          doesRoleReallyExists.permissions.includes(permission);

        if (!doesThisPermissionBelongsToThisRole) {
          throw new BadRequestException(
            `Permissão ${permission.id} não existe ou não pertence a este cargo`,
          );
        }
      }

      for (const updatePermission of updateRoleDTO.updatePermissionDTO) {
        if (updatePermission.take) {
          await this.TakePermissions(updatePermission, queryRunner);
        }

        if (updatePermission.add) {
          await this.AddPermissions(
            doesRoleReallyExists.id,
            updatePermission,
            queryRunner,
          );
        }
      }

      if (updateRoleDTO.name)
        await this.UpdateRoleNameDTO(
          doesRoleReallyExists.id,
          updateRoleDTO.name,
          queryRunner,
        );

      await queryRunner.commitTransaction();

      const findUpdatedRole = await this.roleRepository.findOne({
        where: {
          id,
        },
      });

      if (!findUpdatedRole) {
        throw new NotFoundException('Erro ao recuperar cargo atualizado');
      }

      return findUpdatedRole;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(
        `Erro ao atualizar ${!updateRoleDTO.name ? 'permissao' : 'cargo'}: ${error.message}`,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Falha ao processar transação na atualização ${!updateRoleDTO.name ? 'da permissao' : 'do cargo'}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async TakePermissions(
    updatePermissionDTO: UpdatePermissionDTO,
    queryRunnerSub: QueryRunner,
  ) {
    const removePermissions = await queryRunnerSub.manager.delete(
      Permission,
      updatePermissionDTO.id,
    );

    if (removePermissions.affected === 0) {
      throw new Error('Uma ou mais permissões não encontradas para deletar');
    }
  }

  private async AddPermissions(
    roleId: string,
    updatePermissionDTO: UpdatePermissionDTO,
    queryRunnerSub: QueryRunner,
  ) {
    const newPermissionData = {
      action: updatePermissionDTO.action,
      resource: updatePermissionDTO.resource,
      role: roleId,
    };

    const createNewPermission = queryRunnerSub.manager.create(
      Permission,
      newPermissionData,
    );

    await queryRunnerSub.manager.save(Permission, createNewPermission);
  }

  private async UpdateRoleNameDTO(
    roleId: string,
    roleName: string,
    queryRunnerSub: QueryRunner,
  ) {
    const updateRoleName = await queryRunnerSub.manager.update(Role, roleId, {
      name: roleName,
    });

    if (!updateRoleName || updateRoleName.affected === 0) {
      throw new InternalServerErrorException('Erro ao atualizar nome do cargo');
    }
  }

  async FindById(id: string) {
    const findRole = await this.roleRepository.findOne({
      where: {
        id,
      },
    });

    if (!findRole) {
      throw new NotFoundException('Cargo não encontrado');
    }

    return findRole;
  }
}
