import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ICompanyMemberRepository } from "../../../domain/repositories/company-member.repository.interface";
import { COMPANY_MEMBER_REPOSITORY } from "../../../domain/repositories/company-member.repository.interface";

@Injectable()
export class DeleteCompanyMemberUseCase {
  constructor(
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly memberRepository: ICompanyMemberRepository,
  ) {}

  async execute(companyId: string, id: string): Promise<void> {
    const existing = await this.memberRepository.findUnique({ where: { id } });
    if (!existing || existing.companyId !== companyId) {
      throw new NotFoundException(
        `Member ${id} not found in company ${companyId}`,
      );
    }

    await this.memberRepository.delete(id);
  }
}
