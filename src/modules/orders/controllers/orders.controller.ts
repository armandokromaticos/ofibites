import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "../../../core/domain/enums/role.enum";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { CreateOrderDto } from "../../../core/application/dto/orders/create-order.dto";
import { UpdateOrderStatusDto } from "../../../core/application/dto/orders/update-order-status.dto";
import { OrderResponseDto } from "../../../core/application/dto/orders/order-response.dto";
import { CreateOrderUseCase } from "../../../core/application/use-cases/orders/create-order.use-case";
import { GetOrderUseCase } from "../../../core/application/use-cases/orders/get-order.use-case";
import { GetOrdersUseCase } from "../../../core/application/use-cases/orders/get-orders.use-case";
import { CancelOrderUseCase } from "../../../core/application/use-cases/orders/cancel-order.use-case";
import { UpdateOrderStatusUseCase } from "../../../core/application/use-cases/orders/update-order-status.use-case";

@ApiTags("Orders")
@Controller("orders")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly getOrdersUseCase: GetOrdersUseCase,
    private readonly cancelOrderUseCase: CancelOrderUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
  ) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.CLIENT)
  @ApiOperation({ summary: "Crear orden con items" })
  async createOrder(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: { id: string },
  ): Promise<OrderResponseDto> {
    const entity = await this.createOrderUseCase.execute(user.id, dto);
    return entity.toResponseDto();
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.CLIENT)
  @ApiOperation({ summary: "Listar ordenes (propias o todas para ADMIN)" })
  async findAllOrders(
    @CurrentUser() user: { id: string; role: Role },
  ): Promise<OrderResponseDto[]> {
    const entities = await this.getOrdersUseCase.execute(user.id, user.role);
    return entities.map((order) => order.toResponseDto());
  }

  @Get(":id")
  @Roles(Role.SUPER_ADMIN, Role.CLIENT)
  @ApiOperation({ summary: "Obtener orden por ID" })
  async findOneOrder(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: Role },
  ): Promise<OrderResponseDto> {
    const entity = await this.getOrderUseCase.execute(id, user.id, user.role);
    return entity.toResponseDto();
  }

  @Patch(":id/status")
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: "Cambiar estado de orden (ADMIN)" })
  async updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const entity = await this.updateOrderStatusUseCase.execute(id, dto.status);
    return entity.toResponseDto();
  }

  @Post(":id/cancel")
  @Roles(Role.SUPER_ADMIN, Role.CLIENT)
  @ApiOperation({ summary: "Cancelar orden PENDING" })
  async cancelOrder(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: Role },
  ): Promise<OrderResponseDto> {
    const entity = await this.cancelOrderUseCase.execute(
      id,
      user.id,
      user.role,
    );
    return entity.toResponseDto();
  }
}
