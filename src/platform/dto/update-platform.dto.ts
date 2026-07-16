import { PartialType } from '@nestjs/mapped-types';
import { CreatePlatformDTO } from './create-platform.dto';

export class UpdatePlatformDTO extends PartialType(CreatePlatformDTO) {}
