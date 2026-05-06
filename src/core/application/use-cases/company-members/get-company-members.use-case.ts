import { Inject, Injectable } from "@nestjs/common";
import type { ICompanyMemberRepository } from "../../../domain/repositories/company-member.repository.interface";
import { COMPANY_MEMBER_REPOSITORY } from "../../../domain/repositories/company-member.repository.interface";
import { CompanyMemberEntity } from "../../../domain/entities/company-member.entity";

@Injectable()
export class GetCompanyMembersUseCase {
  constructor(
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly memberRepository: ICompanyMemberRepository,
  ) {}

  async execute(companyId: string): Promise<CompanyMemberEntity[]> {
    const { data } = await this.memberRepository.findMany({
      where: { companyId },
      orderBy: { createdAt: "asc" },
    });
    return data;
  }
}
