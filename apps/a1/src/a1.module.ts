import { Module } from '@nestjs/common';
import { A1Controller } from './a1.controller';
import { A1Service } from './a1.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [A1Controller],
  providers: [A1Service],
})
export class A1Module {}
