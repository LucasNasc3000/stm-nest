import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { CreateLogEmployee } from './dto/create-log-employee.dto';
import { LogEmployee } from './entities/log-employee.entity';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(LogEmployee)
    private readonly logEmployeeRepository: Repository<LogEmployee>,
  ) {}

  async CreateLogEmployee(
    createLogEmployeeDTO: CreateLogEmployee,
    queryRunnerSub: QueryRunner,
  ) {
    const createLog = queryRunnerSub.manager.create(
      LogEmployee,
      createLogEmployeeDTO,
    );

    await queryRunnerSub.manager.save(LogEmployee, createLog);

    return 'Log criado com sucesso';
  }
}
