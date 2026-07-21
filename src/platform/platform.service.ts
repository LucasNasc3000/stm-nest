import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { Employee } from 'src/employee/entities/employee.entity';
import { Repository } from 'typeorm';
import { CreatePlatformDTO } from './dto/create-platform.dto';
import { PaginationByEmployeeDTO } from './dto/pagination-employee.dto';
import { UpdatePlatformDTO } from './dto/update-platform.dto';
import { Platform } from './entities/platform.entity';

@Injectable()
export class PlatformService {
  constructor(
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly logger: Logger,
  ) {}

  async Create(
    tokenPayloadDTO: TokenPayloadDTO,
    createPlatformDTO: CreatePlatformDTO,
  ) {
    const findEmployee = await this.employeeRepository.findOne({
      where: {
        id: tokenPayloadDTO.sub,
      },
    });

    if (!findEmployee) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    const createPlatform = this.platformRepository.create({
      ...createPlatformDTO,
      employee: findEmployee,
    });

    const newPlatform = await this.platformRepository.save(createPlatform);

    return newPlatform;
  }

  async Update(id: string, updatePlatformDTO: UpdatePlatformDTO) {
    const platformUpdate = await this.platformRepository.preload({
      id,
      ...updatePlatformDTO,
    });

    if (!platformUpdate) {
      throw new NotFoundException('Plataforma não encontrada');
    }

    const platformUpdated = await this.platformRepository.save(platformUpdate);

    if (!platformUpdate || !platformUpdated) {
      throw new InternalServerErrorException(
        'Erro ao tentar atualizar plataforma',
      );
    }

    return platformUpdated;
  }

  async Delete(id: string) {
    const findPlatform = await this.platformRepository.findOne({
      where: {
        id,
      },
    });

    if (!findPlatform) {
      throw new NotFoundException('Plataforma não encontrada');
    }

    const deletePlatform = await this.platformRepository.delete(id);

    if (deletePlatform.affected < 1 || !deletePlatform) {
      throw new InternalServerErrorException('Erro ao excluir plataforma');
    }

    return 'Plataforma deletada';
  }

  async FindByEmployee(
    paginationByEmployeeDTO: PaginationByEmployeeDTO,
  ): Promise<[number, Platform[]]> {
    const { limit, offset, value, forDisplay } = paginationByEmployeeDTO;

    const [platformsFindByEmployee, total] =
      await this.platformRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          employee: {
            id: value,
          },
        },
        relations: {
          employee: true,
        },
        select: {
          employee: {
            id: true,
            email: true,
          },
        },
      });

    if (!platformsFindByEmployee) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por plataformas',
      );
    }

    if (platformsFindByEmployee.length < 1 && !forDisplay) {
      throw new NotFoundException('Plataformas não encontradas');
    }

    return [total, platformsFindByEmployee];
  }
}
