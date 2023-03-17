import { Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './entities';

import { BCryptAdapter } from 'src/common/adapter';
import { CreateUserDto, LoginUserDto, PaginationUserDto, UpdateUserDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly configService: ConfigService,
    private readonly bcryptService: BCryptAdapter,

    private readonly jwtService: JwtService,
  ) {
    // this.defaultLimit = configService.get<number>('defaultLimit');
  }

  async create(createUserDto: CreateUserDto) {
    const { password } = createUserDto;
    createUserDto.password = this.bcryptService.hash(password.trim());
    try {
      const user = this.userRepository.create(createUserDto);
      await this.userRepository.save(user);
      delete user.password;

      return { ...user, token: this.getJwtToken({ id: user.id }) };
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    let { password, email } = loginUserDto;

    email = email.toLowerCase().trim();
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true, isActive: true, fullName: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credentials are not valid (email)');
    }
    if (!this.bcryptService.compare(password.trim(), user.password)) {
      throw new UnauthorizedException('Credentials are not valid (password)');
    }

    if (user && !user.isActive) {
      throw new UnauthorizedException(`User ${email} is disabled, contact the administrator`);
    }

    delete user.password;
    delete user.isActive;

    return { ...user, token: this.getJwtToken({ id: user.id }) };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { roles, ...restField } = updateUserDto;

    const userAuth = await this.userRepository.preload({
      id,
      ...restField,
      roles: JSON.stringify(roles),
    });
    if (!userAuth) throw new BadRequestException(`User authenticate with id: ${id} not found`);
    try {
      return await this.userRepository.save(userAuth);
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  checkAuthStatus(user: User) {
    delete user.password;

    return { ...user, token: this.getJwtToken({ id: user.id }) };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);

    return token;
  }

  async findAll(paginationUserDto: PaginationUserDto) {
    const { limit = 10, offset = 0, onlyActive = false } = paginationUserDto;
    let users: User[];

    let usersBuilder = this.userRepository.createQueryBuilder();

    if (onlyActive) {
      usersBuilder = usersBuilder.where('isActive');
    }

    usersBuilder = usersBuilder.skip(offset).take(limit).addOrderBy('fullName', 'ASC');
    users = await usersBuilder.getMany();

    return users.map(({ roles, password, ...rest }) => ({ ...rest, roles: JSON.parse(roles) }));
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  private handleDBExeptions(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException(error.sqlMessage);
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
