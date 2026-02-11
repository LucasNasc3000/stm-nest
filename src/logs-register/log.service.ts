import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLogEmployee } from './dto/create-log-employee.dto';
import { LogEmployee } from './entities/log-employee.entity';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(LogEmployee)
    private readonly logEmployeeRepository: Repository<LogEmployee>,
  ) {}

  async CreateLogEmployee(createLogEmployeeDTO: CreateLogEmployee) {
    const createLog = this.logEmployeeRepository.create(createLogEmployeeDTO);

    const newLog = await this.logEmployeeRepository.save(createLog);

    if (!newLog) {
      throw new InternalServerErrorException('Erro ao criar log');
    }

    return 'Log criado com sucesso';
  }
}
