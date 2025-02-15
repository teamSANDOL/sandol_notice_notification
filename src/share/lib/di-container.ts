/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/prefer-function-type */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/consistent-generic-constructors */
import { dataSource } from "@/connect/data-source";
import { ObjectLiteral, Repository } from "typeorm";

interface Class {
  new (..._args: any[]): any;
}

export class DIContainer {
  private static repositories: Map<Function, Repository<ObjectLiteral>> =
    new Map();

  private static services: Map<Function, ObjectLiteral> = new Map();

  static getRepository<Entity extends Class>(entity: Entity) {
    if (!DIContainer.repositories.has(entity)) {
      DIContainer.repositories.set(
        entity,
        // getRepository를 호출하는 service에서는 무조건 dataSource를 호출하게 된다
        dataSource.getRepository(entity)
      );
    }
    return DIContainer.repositories.get(entity) as Repository<Entity>;
  }

  static setService<T extends ObjectLiteral>(
    constructor: new (..._args: any[]) => T
  ) {
    if (!DIContainer.services.has(constructor)) {
      DIContainer.services.set(constructor, new constructor());
    }
  }

  static getService<Service extends ObjectLiteral>(
    constructor: new (..._args: any[]) => Service
  ) {
    if (!DIContainer.services.has(constructor)) {
      DIContainer.services.set(constructor, new constructor());
    }
    return DIContainer.services.get(constructor) as Service;
  }
}

export function Service(constructor: new (..._args: any[]) => any) {
  // @Service  데코레이션,  Provider 에  해등 클래스가 스캔되면 등록된다
  DIContainer.setService(constructor);
}

export function Inject<Entity extends Class>(entity: Entity) {
  return (target: ObjectLiteral, filedName: string) => {
    Object.defineProperty(target, filedName, {
      writable: false,
      value: DIContainer.getService(entity),
    });
  };
}

export function InjectRepository<Entity extends Class>(entity: Entity) {
  return (target: ObjectLiteral, filedName: string) => {
    Object.defineProperty(target, filedName, {
      writable: false,
      value: DIContainer.getRepository(entity),
    });
  };
}

export const getService = DIContainer.getService;
export const getRepository = DIContainer.getRepository;
