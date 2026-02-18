import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser, AuthUserPayload } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersService } from '../users/users.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { ToggleUserActiveDto } from './dto/toggle-user-active.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.HR_MANAGER)
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async list(@Query() query: ListUsersQueryDto): Promise<{ success: boolean; data: unknown }> {
    const data = await this.usersService.listUsers({
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      search: query.search,
      role: query.role
    });

    return { success: true, data };
  }

  @Patch(':id/role')
  @Roles(Role.ADMIN)
  async changeRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() actor: AuthUserPayload
  ): Promise<{ success: boolean; item: unknown }> {
    const item = await this.usersService.changeRole(id, dto.role, actor.role as Role);
    return { success: true, item };
  }

  @Patch(':id/disable')
  async setActive(
    @Param('id') id: string,
    @Body() dto: ToggleUserActiveDto
  ): Promise<{ success: boolean; item: unknown }> {
    const item = await this.usersService.setUserActive(id, dto.isActive);
    return { success: true, item };
  }
}
