import React, { useState, useEffect } from 'react';
import { CheckCircle, ShieldCheck, Sun, Moon } from 'lucide-react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import Input from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/database/supabase/client";
import fachadaMuviImg from "@/assets/Fachada_Muvi.webp";
import { EstablecerContrasenaProps } from "@/interfaces/components";

export const EstablecerContrasena: React.FC<EstablecerContrasenaProps> = ({ session, onComplete }) => {
    const [passwords, setPasswords] = useState({
        password: '',
        confirmPassword: ''
    });
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

    const [notification, setNotification] = useState<{
        open: boolean;
        message: string;
        severity: AlertColor;
    }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

    useEffect(() => {
        if (session?.user) {
            const metaName = session.user.user_metadata?.username || session.user.user_metadata?.display_name || '';
            setUsername(metaName);
        }
    }, [session]);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    const handleCloseNotification = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setNotification({ ...notification, open: false });
    };

    const manejarCambioPasswords = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value
        });
    };

    const manejarCambioUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    };

    const manejarError = (name: string, hasError: boolean) => {
        setFormErrors(prev => ({ ...prev, [name]: hasError }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwords.password !== passwords.confirmPassword) {
            setNotification({ open: true, message: 'Las contraseñas no coinciden.', severity: 'error' });
            return;
        }

        if (Object.values(formErrors).some(v => v)) {
            setNotification({ open: true, message: 'Por favor, cumple con los requisitos de la contraseña.', severity: 'error' });
            return;
        }

        if (!username.trim()) {
            setNotification({ open: true, message: 'El nombre de usuario es obligatorio.', severity: 'error' });
            return;
        }

        if (!session?.user) return;

        setIsLoading(true);

        try {
            const { error: authError } = await supabase.auth.updateUser({
                password: passwords.password,
                data: { display_name: username, nombre_usuario: username }
            });

            if (authError) throw authError;

            const { error: profileError } = await supabase
                .from('profiles')
                .update({ nombre_usuario: username })
                .eq('id', session.user.id);

            if (profileError) {
                console.error("Error updating profile:", profileError);
                throw new Error("Contraseña actualizada, pero error al guardar el nombre de usuario.");
            }

            setNotification({
                open: true,
                message: 'Cuenta configurada con éxito. Redirigiendo...',
                severity: 'success'
            });

            setTimeout(async () => {
                await supabase.auth.signOut();
                if (onComplete) onComplete();
                window.location.hash = '';
            }, 3000);

        } catch (error: any) {
            console.error('Error configuration:', error);
            setNotification({
                open: true,
                message: error.message || 'Error al configurar la cuenta.',
                severity: 'error'
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen flex bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden transition-colors duration-300">

            {/* Panel izquierdo: Fachada Museo */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">

                <img
                    src={fachadaMuviImg}
                    alt="Fachada Museo MUVI"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70" />

                <div className="relative z-10 flex flex-col h-full p-10 text-white">

                    {/* Bloque principal*/}
                    <div className="flex-1 flex flex-col justify-center space-y-6">
                        <div>
                            <h1 className="text-5xl font-bold leading-tight mb-4">
                                ¡Bienvenido<br />
                                al equipo{session?.user?.user_metadata?.nombre ? `, ${session.user.user_metadata.nombre}` : ''}!
                            </h1>
                            <p className="text-white/70 text-base leading-relaxed max-w-sm">
                                Has sido invitado a formar parte del sistema de gestión del Museo MUVI. Configura tu cuenta para comenzar.
                            </p>
                        </div>


                        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-5 max-w-sm">
                            <p className="text-white/50 text-[10px] uppercase tracking-widest font-semibold mb-1">Tu correo registrado</p>
                            <p className="text-white font-semibold text-base truncate">{session?.user?.email}</p>
                        </div>

                        {/* Lista*/}
                        <div className="space-y-3">
                            {[
                                'Acceso completo al dashboard',
                                'Gestión de visitantes en tiempo real',
                                'Análisis y estadísticas avanzadas'
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="w-3 h-3 text-green-400" />
                                    </div>
                                    <span className="text-white/80 text-sm font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>


                    <p className="text-white/60 text-xs font-medium">
                        © {new Date().getFullYear()} Museo MUVI · Sistema VisiMap
                    </p>
                </div>
            </div>

            {/* Panel derecho: Formulario */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">

                <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl opacity-60 pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-40 pointer-events-none" />

                {/* Botón Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="absolute top-6 right-6 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-90 z-20 shadow-sm border border-slate-200 dark:border-slate-700"
                    title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="relative z-10 w-full max-w-md space-y-8">
                    {/* Encabezado del formulario */}
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Configura tu perfil</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            Establece tu nombre de usuario y contraseña para acceder a{' '}
                            <span className="font-bold text-indigo-600 dark:text-blue-400">VisiMap</span>
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <Input
                            label="Nombre de Usuario"
                            name="username"
                            type="text"
                            value={username}
                            manejarCambio={manejarCambioUsername}
                            manejarError={manejarError}
                            placeholder="Ej: jgarcia"
                            required
                        />

                        <Input
                            label="Nueva Contraseña"
                            type="password"
                            name="password"
                            value={passwords.password}
                            manejarCambio={manejarCambioPasswords}
                            manejarError={manejarError}
                            placeholder="Mínimo 8 carac, 1 mayús, 1 num..."
                            required
                            regex={/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.\-_])[A-Za-z\d@$!%*?&.\-_]{8,}$/}
                            error="Mínimo 8 caracteres, una mayúscula, un número y un carácter especial"
                        />

                        <Input
                            label="Confirmar Contraseña"
                            type="password"
                            name="confirmPassword"
                            value={passwords.confirmPassword}
                            manejarCambio={manejarCambioPasswords}
                            manejarError={manejarError}
                            placeholder="Repite la contraseña"
                            required
                        />

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className={`btn-gradient-auth ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    Guardando...
                                </div>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Establecer Contraseña
                                </span>
                            )}
                        </Button>
                    </form>

                    {/* Info seguridad */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-800/50 flex gap-3 items-start">
                        <div className="bg-blue-100 dark:bg-blue-800/50 p-1.5 rounded-lg text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm">Cuenta segura</h4>
                            <p className="text-blue-700/80 dark:text-blue-400/70 text-xs mt-0.5 leading-relaxed font-medium">
                                Tu contraseña será almacenada de forma segura siguiendo estándares modernos.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </div>
    );
};
