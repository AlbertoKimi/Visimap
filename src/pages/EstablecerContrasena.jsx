import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Eye, EyeOff, CheckCircle, ShieldCheck } from 'lucide-react';
import { Snackbar, Alert } from '@mui/material';
import { InputField } from '../components/InputField';
import { Button } from '../components/button';

const supabaseUrl = "https://vpetkpmxeopozhqizsqx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZXRrcG14ZW9wb3pocWl6c3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzY0MTUsImV4cCI6MjA3ODQ1MjQxNX0.sVooRLG4r_wd2cHNMCngTUPBWnCAVbCwoyibVjoWou8";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const EstablecerContrasena = ({ session, onComplete }) => {
    const [passwords, setPasswords] = useState({
        password: '',
        confirmPassword: ''
    });
    const [username, setUsername] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        if (session?.user) {
            const metaName = session.user.user_metadata?.username || session.user.user_metadata?.display_name || '';
            setUsername(metaName);
        }
    }, [session]);

    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') return;
        setNotification({ ...notification, open: false });
    };

    const handleChange = (e) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwords.password !== passwords.confirmPassword) {
            setNotification({ open: true, message: 'Las contraseñas no coinciden.', severity: 'error' });
            return;
        }

        // Regex
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(passwords.password);
        const hasNumber = /[0-9]/.test(passwords.password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwords.password);

        if (passwords.password.length < minLength || !hasUpperCase || !hasNumber || !hasSpecialChar) {
            setNotification({
                open: true,
                message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.',
                severity: 'error'
            });
            return;
        }

        if (!username.trim()) {
            setNotification({ open: true, message: 'El nombre de usuario es obligatorio.', severity: 'error' });
            return;
        }

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

        } catch (error) {
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
        <div className="h-screen flex bg-white font-sans overflow-hidden">

            {/* Panel izquierdo */}

            <div className="hidden lg:flex lg:w-5/12 relative bg-gradient-to-br from-blue-600 to-purple-700 text-white flex-col justify-between p-10 overflow-hidden">

                <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 opacity-20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

                <div className="relative z-10 flex-shrink-0">
                    <div className="flex items-center gap-4 mb-2">
                        <div>
                            <h1 className="text-3xl font-bold">VisiMap</h1>
                            <p className="text-blue-100 text-sm opacity-80">Museo MUVI</p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-blue-50 mt-6 mb-4 border border-white/20">
                        <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse"></span>
                        Invitación especial
                    </div>

                    <h2 className="text-4xl font-bold mb-4 leading-tight">
                        ¡Bienvenido al<br />equipo{session?.user?.user_metadata?.nombre ? `, ${session.user.user_metadata.nombre}` : ''}!
                    </h2>

                    <p className="text-blue-100 mb-6 leading-relaxed max-w-md text-sm">
                        Has sido invitado a formar parte del sistema de gestión del Museo MUVI.
                        Configura tu cuenta para comenzar.
                    </p>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 mb-6">
                        <p className="text-[10px] text-blue-200 uppercase tracking-wider font-bold mb-1">Tu correo registrado:</p>
                        <p className="text-base font-semibold text-white truncate">{session?.user?.email}</p>
                    </div>

                    <div className="space-y-3">
                        {[
                            'Acceso completo al dashboard',
                            'Gestión de visitantes en tiempo real',
                            'Análisis y estadísticas avanzadas'
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-400/30 flex-shrink-0">
                                    <CheckCircle className="w-3 h-3 text-blue-300" />
                                </div>
                                <span className="text-blue-50 font-medium text-sm">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 mt-auto pt-4 flex-1 min-h-0 flex flex-col justify-end">

                    <div className="w-full h-full max-h-48 rounded-t-3xl bg-gradient-to-t from-blue-900/40 to-transparent border-t border-white/10 overflow-hidden relative opacity-80 hover:opacity-100 transition-opacity">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554907984-15263bfd63bd?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-70 mix-blend-overlay"></div>
                    </div>
                </div>
            </div>

            {/* Formulario */}

            <div className="w-full lg:w-7/12 flex flex-col justify-center items-center p-8 lg:px-24 overflow-hidden relative">

                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="w-full max-w-sm space-y-8 z-10">

                    <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Crea tu Contraseña</h2>
                        <p className="text-slate-500 text-sm">
                            Establece tu nombre de usuario y contraseña para acceder a <span className="font-semibold text-indigo-600">VisiMap</span>
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <InputField
                            label="Nombre de Usuario"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ej: jgarcia"
                            required
                            className="h-14 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all font-medium text-slate-700 text-lg px-4"
                            labelClassName="text-slate-600 font-semibold"
                        />

                        <div className="relative">
                            <InputField
                                label="Nueva Contraseña"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={passwords.password}
                                onChange={handleChange}
                                placeholder="Mínimo 8 caracteres, 1 mayus, 1 num..."
                                required
                                className="h-14 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all font-medium pr-12 text-slate-700 text-lg px-4"
                                labelClassName="text-slate-600 font-semibold"
                            />
                            <button
                                type="button"
                                className="absolute right-4 top-[42px] text-gray-400 hover:text-indigo-600 transition-colors bg-white/50 rounded-full p-1"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                            </button>
                        </div>

                        <div className="relative">
                            <InputField
                                label="Confirmar Contraseña"
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={passwords.confirmPassword}
                                onChange={handleChange}
                                placeholder="Repite la contraseña"
                                required
                                className="h-14 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all font-medium pr-12 text-slate-700 text-lg px-4"
                                labelClassName="text-slate-600 font-semibold"
                            />
                            <button
                                type="button"
                                className="absolute right-4 top-[42px] text-gray-400 hover:text-indigo-600 transition-colors bg-white/50 rounded-full p-1"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full h-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 group ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Guardando...
                                </div>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Establecer Contraseña
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-100 flex gap-3 items-start">
                        <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600 mt-0.5">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-blue-900 text-sm">Cuenta segura</h4>
                            <p className="text-blue-700/80 text-xs mt-0.5 leading-relaxed">
                                Tu contraseña será almacenada de forma segura.
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
