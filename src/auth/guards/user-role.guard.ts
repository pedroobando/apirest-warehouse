import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators';
import { User } from '../entities';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler());

    if (!validRoles) return true;
    if (validRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // console.log(user.roles);
    const userRoles = JSON.parse(user.roles);

    for (const role of userRoles) {
      if (validRoles.includes(role)) {
        return true;
      }
    }

    throw new ForbiddenException(`User ${user.fullName} need a valid role: [${validRoles}]`);
  }
}
