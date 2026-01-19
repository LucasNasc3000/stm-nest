import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Outflow } from './entities/outflow.entity';

@Injectable()
export class OutflowService {
  constructor(
    @InjectRepository(Outflow)
    private readonly outflowRepository: Repository<Outflow>,
  ) {}
}
