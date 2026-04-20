import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { GeneralErrorType } from 'src/common/enums/general-error-type.enum';
import { Permission } from 'src/role/entities/permission.entity';
import { GetErrorMessage } from 'src/utils/error-message.util';
import { ErrorManagement } from 'src/utils/error.util';
import { DataSource, QueryFailedError, QueryRunner, Repository } from 'typeorm';
import { CreateRoleDTO } from './dto/create-role.dto';
import { UpdateRoleDTO } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly logger: Logger,
    private dataSource: DataSource,
  ) {}

  async CreateRole(createRoleDTO: CreateRoleDTO) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const permissions = createRoleDTO.permissions.map((p) => ({
        action: p.action,
        resource: p.resource,
      }));

      const newRole = await queryRunner.manager.upsert(
        Permission,
        permissions,
        ['action', 'resource'],
      );

      const savedPermissions = await queryRunner.manager.find(Permission, {
        where: permissions,
      });

      const createRole = queryRunner.manager.create(Role, {
        name: createRoleDTO.name,
        permissions: savedPermissions,
      });

      await queryRunner.manager.save(Role, createRole);

      await queryRunner.commitTransaction();

      return newRole;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      ErrorManagement(error, GeneralErrorType.INTERNAL, {
        logger: 'Erro ao criar cargo:',
        queryFailedError: 'Erro cadastrar cargo',
        internalServerError: 'Erro interno ao criar cargo',
        generalError: 'Falha ao processar transação na criação de cargo',
      });
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

      if (updateRoleDTO.updatePermissionDTO) {
        const toAdd = updateRoleDTO.updatePermissionDTO.filter((p) => p.add);
        const toTakeIds = updateRoleDTO.updatePermissionDTO
          .filter((p) => p.take)
          .map((p) => p.id);

        doesRoleReallyExists.permissions =
          doesRoleReallyExists.permissions.filter(
            (p) => !toTakeIds.includes(p.id),
          );

        if (toAdd.length > 0) {
          const add = toAdd.map((p) => ({
            action: p.action,
            resource: p.resource,
          }));

          await queryRunner.manager.upsert(Permission, add, [
            'action',
            'resource',
          ]);

          const savedPermissions = await queryRunner.manager.find(Permission, {
            where: add,
          });

          for (const p of savedPermissions) {
            if (
              !doesRoleReallyExists.permissions.find(
                (existing) => existing.id === p.id,
              )
            ) {
              doesRoleReallyExists.permissions.push(p);
            }
          }
        }
      }

      if (updateRoleDTO.name)
        await this.UpdateRoleNameDTO(
          doesRoleReallyExists.id,
          updateRoleDTO.name,
          queryRunner,
        );

      await queryRunner.manager.save(Role, doesRoleReallyExists);

      await queryRunner.commitTransaction();

      await this.cacheManager.del(`role_permissions_${id}`);

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

      const errorMessage = GetErrorMessage(error);

      this.logger.error(
        `Erro ao atualizar ${!updateRoleDTO.name ? 'permissao' : 'cargo'}: ${errorMessage}`,
        error instanceof Error ? error.stack : null,
      );

      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException(
          `Erro ao atualizar registro de ${!updateRoleDTO.name ? 'permissao' : 'cargo'}`,
        );
      }

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
