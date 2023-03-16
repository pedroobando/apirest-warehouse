import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Headers,
  Patch,
  ParseUUIDPipe,
  Param,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IncomingHttpHeaders } from 'http';
import { RawHeaders } from 'src/common/decorators';
import { AuthService } from './auth.service';
import { Auth, GetUser, RoleProtected } from './decorators';
import { CreateUserDto, LoginUserDto, PaginationUserDto, UpdateUserDto } from './dto';
import { User } from './entities';
import { UserRoleGuard } from './guards';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Patch('update/:id')
  @Auth()
  updateUser(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.authService.update(id, updateUserDto);
  }

  @Get()
  findAll(@Query() paginationUserDto: PaginationUserDto) {
    return this.authService.findAll(paginationUserDto);
  }

  @Get('checkauthstatus')
  @UseGuards(AuthGuard())
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  privateRoutes(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ) {
    return { ok: true, message: 'Hola Mundo Private', user, userEmail, rawHeaders, headers };
  }

  // @SetMetadata('roles', ['admin', 'super-user'])

  @Get('private2')
  @RoleProtected(ValidRoles.superUser)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }

  @Get('private3')
  @Auth(ValidRoles.superUser)
  privateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }
}
