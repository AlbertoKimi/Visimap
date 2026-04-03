import { SupabaseAuthRepository } from './supabase/SupabaseAuthRepository';
import { SupabaseVisitorRepository } from './supabase/SupabaseVisitorRepository';
import { SupabaseUserRepository } from './supabase/SupabaseUserRepository';
import { SupabaseRoleRepository } from './supabase/SupabaseRoleRepository';
import { SupabaseEventRepository } from './supabase/SupabaseEventRepository';
import { SupabaseEventTypeRepository } from './supabase/SupabaseEventTypeRepository';

import { AuthRepository } from './repositories/AuthRepository';
import { VisitorRepository } from './repositories/VisitorRepository';
import { UserRepository } from './repositories/UserRepository';
import { RoleRepository } from './repositories/RoleRepository';
import { EventRepository } from './repositories/EventRepository';
import { EventTypeRepository } from './repositories/EventTypeRepository';

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
}
