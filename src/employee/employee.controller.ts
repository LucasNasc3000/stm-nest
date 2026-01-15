import { Controller } from '@nestjs/common';
import { EmployeeService } from './employee.service';

@Controller()
export class EmployeeController {
  constructor(private readonly employeesService: EmployeeService) {}
}
