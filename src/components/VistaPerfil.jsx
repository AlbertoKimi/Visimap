import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const VistaPerfil = ({ session }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar cambios
    console.log('Guardando cambios...');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Mi Perfil</h2>
        <p className="text-slate-500">Administra tu información personal y preferencias.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Tarjeta de Resumen */}
        <Card className="border-none shadow-xl h-fit">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl mb-6 ring-4 ring-white">
              {session?.user?.email?.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-xl font-bold text-slate-800">Administrador</h3>
            <p className="text-sm text-slate-500 mb-4">{session?.user?.email}</p>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
                Online
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                Admin
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Formulario para modificar datos */}
        <Card className="md:col-span-2 border-none shadow-xl">
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nombre</label>
                  <input 
                    type="text" 
                    defaultValue="Administrador" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Apellidos</label>
                  <input 
                    type="text" 
                    defaultValue="MUVI" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Correo Electrónico</label>
                <input 
                  type="email" 
                  defaultValue={session?.user?.email} 
                  disabled 
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Teléfono</label>
                <input 
                  type="tel" 
                  placeholder="+34 600 000 000" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                />
              </div>

              <div className="pt-4 flex justify-end gap-4">
                <Button variant="outline" className="border-slate-200">
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg">
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};