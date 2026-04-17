import { Rol } from "@/interfaces/Rol";

export interface RoleRepository {
  getAll(): Promise<Rol[]>;
}
