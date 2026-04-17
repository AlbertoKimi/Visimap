import { SupabaseAuthRepository } from "@/database/supabase/SupabaseAuthRepository";
import { SupabaseVisitorRepository } from "@/database/supabase/SupabaseVisitorRepository";
import { SupabaseUserRepository } from "@/database/supabase/SupabaseUserRepository";
import { SupabaseRoleRepository } from "@/database/supabase/SupabaseRoleRepository";
import { SupabaseEventRepository } from "@/database/supabase/SupabaseEventRepository";
import { SupabaseEventTypeRepository } from "@/database/supabase/SupabaseEventTypeRepository";
import { SupabaseNotaRepository } from "@/database/supabase/SupabaseNotaRepository";

import { AuthRepository } from './repositories/AuthRepository';
import { VisitorRepository } from './repositories/VisitorRepository';
import { UserRepository } from './repositories/UserRepository';
import { RoleRepository } from './repositories/RoleRepository';
import { EventRepository } from './repositories/EventRepository';
import { EventTypeRepository } from './repositories/EventTypeRepository';
import { NotaRepository } from './repositories/NotaRepository';

export class RepositoryFactory {
  static getAuthRepository(): AuthRepository {
    return SupabaseAuthRepository.getInstance();
  }

  static getVisitorRepository(): VisitorRepository {
    return SupabaseVisitorRepository.getInstance();
  }

  static getUserRepository(): UserRepository {
    return SupabaseUserRepository.getInstance();
  }

  static getRoleRepository(): RoleRepository {
    return SupabaseRoleRepository.getInstance();
  }

  static getEventRepository(): EventRepository {
    return SupabaseEventRepository.getInstance();
  }

  static getEventTypeRepository(): EventTypeRepository {
    return SupabaseEventTypeRepository.getInstance();
  }

  static getNotaRepository(): NotaRepository {
    return SupabaseNotaRepository.getInstance();
  }
}
