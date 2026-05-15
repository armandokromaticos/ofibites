import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { SupabaseService } from "../../../core/infrastructure/supabase/supabase.service";
import type { ICompanyMemberRepository } from "../../../core/domain/repositories/company-member.repository.interface";
import { COMPANY_MEMBER_REPOSITORY } from "../../../core/domain/repositories/company-member.repository.interface";

const COMPANY_ID_HEADER = "x-company-id";
const LAST_SEEN_DEBOUNCE_MS = 5 * 60 * 1000;

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly companyMemberRepository: ICompanyMemberRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException("Token no proporcionado");
    }

    const supabase = this.supabaseService.getAdmin();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException("Token inválido o expirado");
    }

    request["user"] = {
      authId: data.user.id,
      email: data.user.email ?? "",
    };

    this.touchLastSeen(request, data.user.id);

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }

  private touchLastSeen(request: Request, authId: string): void {
    const headerValue = request.headers[COMPANY_ID_HEADER];
    const companyId = Array.isArray(headerValue) ? headerValue[0] : headerValue;
    if (!companyId) {
      return;
    }

    void this.companyMemberRepository
      .touchLastSeenIfStale(authId, companyId, LAST_SEEN_DEBOUNCE_MS)
      .catch((err: unknown) => {
        this.logger.error(
          `Error updating lastSeenAt for authId=${authId} companyId=${companyId}`,
          err instanceof Error ? err.stack : String(err),
        );
      });
  }
}
