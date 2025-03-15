import { Controller, Get } from '@nestjs/common';
import { A1Service } from './a1.service';

@Controller()
export class A1Controller {
  constructor(private readonly a1Service: A1Service) {}

  @Get()
  getHello(): string {
    return this.a1Service.getHello();
  }
}
