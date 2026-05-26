import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import type { ICompanyRegistrationRequestRepository } from "../../../domain/repositories/company-registration-request.repository.interface";
import { COMPANY_REGISTRATION_REQUEST_REPOSITORY } from "../../../domain/repositories/company-registration-request.repository.interface";
import { CompanyRegistrationRequestEntity } from "../../../domain/entities/company-registration-request.entity";
import { ListCompanyRegistrationRequestsQueryDto } from "../../dto/company-registration-requests/list-company-registration-requests-query.dto";

const DEFAULT_PAGE_SIZE = 20;

export interface ListCompanyRegistrationRequestsResult {
  data: CompanyRegistrationRequestEntity[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class ListCompanyRegistrationRequestsUseCase {
  constructor(
    @Inject(COMPANY_REGISTRATION_REQUEST_REPOSITORY)
    private readonly requestRepository: ICompanyRegistrationRequestRepository,
  ) {}

  async execute(
    query: ListCompanyRegistrationRequestsQueryDto,
  ): Promise<ListCompanyRegistrationRequestsResult> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
    const skip = (page - 1) * pageSize;

    const { data, total } = await this.requestRepository.findMany({
      where: query.status ? { status: query.status } : undefined,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    });

    if (typeof total !== "number") {
      // El repo siempre devuelve `total` cuando hay `skip`/`take`. Si llegó undefined
      // es una violación del contrato — fallar explícito en vez de devolver un total
      // engañoso (`data.length` daría conteos inconsistentes a partir de la página 2).
      throw new InternalServerErrorException(
        "El repositorio no devolvió un total para una consulta paginada.",
      );
    }

    return { data, total, page, pageSize };
  }
}
