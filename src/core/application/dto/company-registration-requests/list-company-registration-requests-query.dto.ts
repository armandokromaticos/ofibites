import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { RegistrationRequestStatus } from "../../../domain/enums/registration-request-status.enum";

export class ListCompanyRegistrationRequestsQueryDto {
  @ApiPropertyOptional({
    enum: RegistrationRequestStatus,
    description: "Filtra por estado de la solicitud.",
  })
  @IsOptional()
  @IsEnum(RegistrationRequestStatus)
  status?: RegistrationRequestStatus;

  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    description: "Página 1-based.",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 20,
    minimum: 1,
    maximum: 100,
    description: "Tamaño de página (default 20, máximo 100).",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
