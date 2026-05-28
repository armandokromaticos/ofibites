import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import type { IUserRepository } from "../../../domain/repositories/user.repository.interface";
import { USER_REPOSITORY } from "../../../domain/repositories/user.repository.interface";
import type { ICompanyMemberRepository } from "../../../domain/repositories/company-member.repository.interface";
import { COMPANY_MEMBER_REPOSITORY } from "../../../domain/repositories/company-member.repository.interface";
import { SupabaseService } from "../../../infrastructure/supabase/supabase.service";
import { UserEntity } from "../../../domain/entities/user.entity";
import {
  PendingInvitationMembershipDto,
  PendingInvitationResponseDto,
} from "../../dto/invitations/pending-invitation-response.dto";

const PER_PAGE = 1000;

@Injectable()
export class GetPendingInvitationsUseCase {
  private readonly logger = new Logger(GetPendingInvitationsUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly memberRepository: ICompanyMemberRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  async execute(
    companyIdFilter?: string,
  ): Promise<PendingInvitationResponseDto[]> {
    const pendingAuthUsers = await this.listPendingAuthUsers();
    if (pendingAuthUsers.length === 0) {
      return [];
    }

    const authIds = pendingAuthUsers.map((user) => user.id);
    const { data: localUsers } = await this.userRepository.findMany({
      where: { authId: { in: authIds } },
    });
    const userByAuthId = new Map<string, UserEntity>(
      localUsers
        .filter((user) => user.authId !== null)
        .map((user) => [user.authId as string, user]),
    );

    const memberships = await this.memberRepository.findAllByUserIdsWithRefs(
      localUsers.map((user) => user.id),
    );
    const membershipsByUserId = new Map<
      string,
      PendingInvitationMembershipDto[]
    >();
    for (const membership of memberships) {
      const list = membershipsByUserId.get(membership.userId) ?? [];
      list.push({
        companyId: membership.companyId,
        companyName: membership.companyName,
        companyRole: membership.role,
        branchName: membership.branchName,
        departmentName: membership.departmentName,
      });
      membershipsByUserId.set(membership.userId, list);
    }

    const result = pendingAuthUsers.map((authUser) => {
      const local = userByAuthId.get(authUser.id);
      const userMemberships = local
        ? (membershipsByUserId.get(local.id) ?? [])
        : [];
      return {
        authId: authUser.id,
        userId: local?.id ?? null,
        email: local?.email ?? authUser.email ?? "",
        name: local?.name ?? this.metadataName(authUser),
        role: local?.role ?? null,
        invitedAt: this.invitedAt(authUser),
        memberships: userMemberships,
      };
    });

    if (companyIdFilter) {
      return result.filter((invitation) =>
        invitation.memberships.some(
          (membership) => membership.companyId === companyIdFilter,
        ),
      );
    }
    return result;
  }

  private async listPendingAuthUsers(): Promise<SupabaseAuthUser[]> {
    const admin = this.supabaseService.getAdmin().auth.admin;
    const pending: SupabaseAuthUser[] = [];

    for (let page = 1; ; page++) {
      const { data, error } = await admin.listUsers({
        page,
        perPage: PER_PAGE,
      });
      if (error) {
        this.logger.error(
          `Error listando usuarios de Supabase Auth: ${error.message}`,
        );
        throw new InternalServerErrorException(
          "No se pudo consultar las invitaciones en Supabase.",
        );
      }
      const users = data?.users ?? [];
      for (const user of users) {
        if (!user.email_confirmed_at) {
          pending.push(user);
        }
      }
      if (users.length < PER_PAGE) {
        break;
      }
    }

    return pending;
  }

  private metadataName(authUser: SupabaseAuthUser): string | null {
    const meta = (authUser.user_metadata ?? {}) as { name?: unknown };
    return typeof meta.name === "string" ? meta.name : null;
  }

  private invitedAt(authUser: SupabaseAuthUser): Date | null {
    const raw = authUser.invited_at ?? authUser.created_at;
    return raw ? new Date(raw) : null;
  }
}
