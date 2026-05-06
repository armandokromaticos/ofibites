import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CompaniesModule } from "../companies/companies.module";
import { DepartmentsController } from "./controllers/departments.controller";
import { DEPARTMENT_REPOSITORY } from "../../core/domain/repositories/department.repository.interface";
import { DepartmentRepository } from "../../core/infrastructure/repositories/department.repository";
import { CreateDepartmentUseCase } from "../../core/application/use-cases/departments/create-department.use-case";
import { GetDepartmentUseCase } from "../../core/application/use-cases/departments/get-department.use-case";
import { GetDepartmentsUseCase } from "../../core/application/use-cases/departments/get-departments.use-case";
import { UpdateDepartmentUseCase } from "../../core/application/use-cases/departments/update-department.use-case";
import { DeleteDepartmentUseCase } from "../../core/application/use-cases/departments/delete-department.use-case";

@Module({
  imports: [AuthModule, CompaniesModule],
  controllers: [DepartmentsController],
  providers: [
    { provide: DEPARTMENT_REPOSITORY, useClass: DepartmentRepository },
    CreateDepartmentUseCase,
    GetDepartmentUseCase,
    GetDepartmentsUseCase,
    UpdateDepartmentUseCase,
    DeleteDepartmentUseCase,
  ],
  exports: [DEPARTMENT_REPOSITORY],
})
export class DepartmentsModule {}
