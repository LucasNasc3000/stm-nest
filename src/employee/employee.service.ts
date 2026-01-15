import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';

@Injectable()
export class EmployeeService {
  constructor(private readonly employeesRepository: Repository<Employee>) {}
}
