import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ICompanyMemberRepository } from "../../../domain/repositories/company-member.repository.interface";
import { COMPANY_MEMBER_REPOSITORY } from "../../../domain/repositories/company-member.repository.interface";
import { CompanyMemberEntity } from "../../../domain/entities/company-member.entity";

@Injectable()
export class GetCompanyMemberUseCase {
  constructor(
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly memberRepository: ICompanyMemberRepository,
  ) {}

  async execute(
    companyId: string,
    id: string,
  ): Promise<CompanyMemberEntity> {
    const member = await this.memberRepository.findUnique({ where: { id } });
    if (!member || member.companyId !== companyId) {
      throw new NotFoundException(
        `Member ${id} not found in company ${companyId}`,
      );
    }
    return member;
  }
}
