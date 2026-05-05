import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { Request } from "express";
import { SupabaseService } from "../../../core/infrastructure/supabase/supabase.service";
import type { IUserRepository } from "../../../core/domain/repositories/user.repository.interface";
import { USER_REPOSITORY } from "../../../core/domain/repositories/user.repository.interface";

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(OptionalJwtAuthGuard.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      return true;
    }

    const supabase = this.supabaseService.getAdmin();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      this.logger.debug(
        `Optional auth: token present but invalid; continuing as guest (reason=${error?.message ?? "no user in response"})`,
      );
      return true;
    }

    const dbUser = await this.userRepository.findUnique({
      where: { authId: data.user.id },
    });
    if (!dbUser) {
      this.logger.debug(
        `Optional auth: valid Supabase user but no DB record; continuing as guest (authId=${data.user.id})`,
      );
      return true;
    }
    if (!dbUser.isActive) {
      this.logger.debug(
        `Optional auth: DB user is inactive; continuing as guest (authId=${data.user.id}, userId=${dbUser.id})`,
      );
      return true;
    }

    request["user"] = {
      authId: data.user.id,
      email: data.user.email ?? "",
      id: dbUser.id,
      role: dbUser.role,
      isActive: dbUser.isActive,
    };

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
