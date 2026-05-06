import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { CreateCompanyAddressDto } from "../../../core/application/dto/company-addresses/create-company-address.dto";
import { UpdateCompanyAddressDto } from "../../../core/application/dto/company-addresses/update-company-address.dto";
import { CompanyAddressResponseDto } from "../../../core/application/dto/company-addresses/company-address-response.dto";
import { CreateCompanyAddressUseCase } from "../../../core/application/use-cases/company-addresses/create-company-address.use-case";
import { GetCompanyAddressUseCase } from "../../../core/application/use-cases/company-addresses/get-company-address.use-case";
import { GetCompanyAddressesUseCase } from "../../../core/application/use-cases/company-addresses/get-company-addresses.use-case";
import { UpdateCompanyAddressUseCase } from "../../../core/application/use-cases/company-addresses/update-company-address.use-case";
import { DeleteCompanyAddressUseCase } from "../../../core/application/use-cases/company-addresses/delete-company-address.use-case";

@ApiTags("Company Addresses")
@ApiBearerAuth()
@Controller("companies/:companyId/addresses")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyAddressesController {
  constructor(
    private readonly createUseCase: CreateCompanyAddressUseCase,
    private readonly getUseCase: GetCompanyAddressUseCase,
    private readonly getAllUseCase: GetCompanyAddressesUseCase,
    private readonly updateUseCase: UpdateCompanyAddressUseCase,
    private readonly deleteUseCase: DeleteCompanyAddressUseCase,
  ) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.OPS_ADMIN)
  @ApiOperation({ summary: "Crear dirección" })
  async create(
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Body() dto: CreateCompanyAddressDto,
  ): Promise<CompanyAddressResponseDto> {
    const address = await this.createUseCase.execute(companyId, dto);
    return CompanyAddressResponseDto.fromEntity(address);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.OPS_ADMIN, Role.FINANCE_ADMIN, Role.KAM)
  @ApiOperation({ summary: "Listar direcciones de la empresa" })
  async findAll(
    @Param("companyId", ParseUUIDPipe) companyId: string,
  ): Promise<CompanyAddressResponseDto[]> {
    const addresses = await this.getAllUseCase.execute(companyId);
    return addresses.map((a) => CompanyAddressResponseDto.fromEntity(a));
  }

  @Get(":id")
  @Roles(Role.SUPER_ADMIN, Role.OPS_ADMIN, Role.FINANCE_ADMIN, Role.KAM)
  @ApiOperation({ summary: "Obtener dirección" })
  async findOne(
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<CompanyAddressResponseDto> {
    const address = await this.getUseCase.execute(companyId, id);
    return CompanyAddressResponseDto.fromEntity(address);
  }

  @Patch(":id")
  @Roles(Role.SUPER_ADMIN, Role.OPS_ADMIN)
  @ApiOperation({ summary: "Actualizar dirección" })
  async update(
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompanyAddressDto,
  ): Promise<CompanyAddressResponseDto> {
    const address = await this.updateUseCase.execute(companyId, id, dto);
    return CompanyAddressResponseDto.fromEntity(address);
  }

  @Delete(":id")
  @HttpCode(204)
  @Roles(Role.SUPER_ADMIN, Role.OPS_ADMIN)
  @ApiOperation({ summary: "Eliminar dirección" })
  async remove(
    @Param("companyId", ParseUUIDPipe) companyId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.deleteUseCase.execute(companyId, id);
  }
}
