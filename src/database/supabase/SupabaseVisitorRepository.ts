import { supabase } from './client';
import { Pais, Provincia, RegistroVisitante } from "@/interfaces/Visitor";
import { VisitorRepository } from '../repositories/VisitorRepository';

export class SupabaseVisitorRepository implements VisitorRepository {
  private static instance: SupabaseVisitorRepository;

  private constructor() {}

  public static getInstance(): SupabaseVisitorRepository {
    if (!SupabaseVisitorRepository.instance) {
      SupabaseVisitorRepository.instance = new SupabaseVisitorRepository();
    }
    return SupabaseVisitorRepository.instance;
  }

  async getPaisByName(name: string): Promise<Pais | null> {
    const { data, error } = await supabase
      .from('pais')
      .select('id_pais, nombre_pais')
      .ilike('nombre_pais', name.trim())
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getProvinciaByName(name: string): Promise<Provincia | null> {
    const { data, error } = await supabase
      .from('provincia')
      .select('id_provincia, nombre_provincia')
      .ilike('nombre_provincia', name.trim())
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createRegistro(registro: RegistroVisitante): Promise<void> {
    const { 
        id_pais, 
        id_provincia, 
        id_usuario, 
        cantidad, 
        tipo_visita, 
        observaciones 
    } = registro;

    const { error } = await supabase
      .from('registro_visitante')
      .insert([{
        id_pais,
        id_provincia,
        id_usuario,
        cantidad,
        tipo_visita,
        observaciones
      }]);

    if (error) throw error;
  }

  async getAllRegistros(): Promise<any[]> {
    // Traemos los datos básicos primero
    const { data: registros, error: regError } = await supabase
      .from('registro_visitante')
      .select('*, provincia:id_provincia(nombre_provincia), pais:id_pais(nombre_pais)')
      .order('creado_en', { ascending: false });

    if (regError) throw regError;
    if (!registros || registros.length === 0) return [];

    // Obtenemos los IDs únicos de usuario
    const userIds = [...new Set(registros.map(r => r.id_usuario))];

    // Traemos los perfiles en una sola consulta
    const { data: perfiles, error: perfError } = await supabase
      .from('profiles')
      .select('id, nombre_usuario, nombre, avatar_url')
      .in('id', userIds);

    if (perfError) {
        console.error('Error al cargar perfiles:', perfError);
        return registros;
    }

    // Mapeamos los perfiles por ID
    const perfilesMap = perfiles.reduce((acc: any, p: any) => {
        acc[p.id] = p;
        return acc;
    }, {});

    // Unimos los datos
    return registros.map(r => ({
        ...r,
        perfil: perfilesMap[r.id_usuario] || null
    }));
  }

  async deleteRegistro(id: number): Promise<void> {
    const { error } = await supabase
      .from('registro_visitante')
      .delete()
      .eq('id_registro', id);

    if (error) throw error;
  }

  async updateRegistro(id: number, cantidad: number): Promise<void> {
    const tipo_visita = cantidad > 1 ? 'grupo' : 'individual';
    const { error } = await supabase
      .from('registro_visitante')
      .update({ cantidad, tipo_visita })
      .eq('id_registro', id);

    if (error) throw error;
  }

  async getAllPaises(): Promise<Pais[]> {
    const { data, error } = await supabase
      .from('pais')
      .select('id_pais, nombre_pais, codigo_iso')
      .order('nombre_pais', { ascending: true });

    if (error) throw error;

    // Colocar España el primero de la lista por conveniencia
    const paises = data || [];
    const espIndex = paises.findIndex(p => p.nombre_pais === 'España');
    if (espIndex > -1) {
      const esp = paises.splice(espIndex, 1)[0];
      paises.unshift(esp);
    }

    return paises;
  }
}
