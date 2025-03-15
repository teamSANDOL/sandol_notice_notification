import { Injectable } from '@nestjs/common';

@Injectable()
export class A1Service {
  getHello(): string {
    return 'Hello World!';
  }
}
