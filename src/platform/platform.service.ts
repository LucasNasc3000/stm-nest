import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { Employee } from 'src/employee/entities/employee.entity';
import { Repository } from 'typeorm';
import { CreatePlatformDTO } from './dto/create-platform.dto';
import { UpdatePlatformDTO } from './dto/update-platform.dto';
import { Platform } from './entities/platform.entity';

@Injectable()
export class PlaftormService {
  constructor(
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
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
    const findPlaftorm = await this.platformRepository.findOne({
      where: {
        id,
      },
    });

    if (!findPlaftorm) {
      throw new NotFoundException('Plataforma não encontrada');
    }

    const platformUpdate =
      await this.platformRepository.preload(updatePlatformDTO);

    const platformUpdated = await this.platformRepository.save(platformUpdate);

    if (!platformUpdate || !platformUpdated) {
      throw new InternalServerErrorException(
        'Erro ao tentar atualizar plataforma',
      );
    }

    return platformUpdated;
  }
}
