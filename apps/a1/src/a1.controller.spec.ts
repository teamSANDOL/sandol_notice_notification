import { Test, TestingModule } from '@nestjs/testing';
import { A1Controller } from './a1.controller';
import { A1Service } from './a1.service';

describe('A1Controller', () => {
  let a1Controller: A1Controller;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [A1Controller],
      providers: [A1Service],
    }).compile();

    a1Controller = app.get<A1Controller>(A1Controller);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(a1Controller.getHello()).toBe('Hello World!');
    });
  });
});
