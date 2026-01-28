import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class PhoneNumberValidation implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const phoneNumber = String(value);

    if (metadata.type !== 'body') {
      throw new BadRequestException('metadata type must be "body"');
    }

    if (phoneNumber.length < 14 || phoneNumber.length > 14) {
      throw new BadRequestException('Formato inválido');
    }

    if (
      !phoneNumber.includes('(') &&
      !phoneNumber.includes(')') &&
      !phoneNumber.includes(' ') &&
      !phoneNumber.includes('-')
    ) {
      throw new BadRequestException('Formato inválido');
    }

    return value;
  }
}
