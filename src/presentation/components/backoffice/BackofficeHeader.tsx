import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function BackofficeHeader() {
    const { logout, user } = useAuth();

    return (
        <>
            {/* Top Info Bar */}
            <div className="bg-brand-purple-dark text-white py-2 px-4 md:px-8 lg:px-16 flex flex-col md:flex-row justify-between items-center text-xs">
                <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8">
                    <a className="flex items-center gap-1 hover:text-brand-yellow transition-colors" href="mailto:servicio@koneksi.com.do">
                        <span className="material-symbols-outlined text-[16px]">mail</span>
                        servicio@koneksi.com.do
                    </a>
                    <span className="hidden sm:flex items-center gap-1 text-white">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        Torre Bolivar #195, Av. Simón Bolívar, Sto. Dgo., RD
                    </span>
                    <a className="flex items-center gap-1 hover:text-brand-yellow transition-colors" href="tel:+18092210080">
                        <span className="material-symbols-outlined text-[16px]">call</span>
                        +1 (809) 221-0080
                    </a>
                </div>
            </div>

            {/* Main Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <nav className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                    <Link to="/backoffice/dashboard" className="flex items-center gap-3">
                        <div className="flex items-center">
                            <svg height="40" viewBox="0 0 100 60" width="40" xmlns="http://www.w3.org/2000/svg">
                                <path d="M30 15C15 15 15 45 30 45C38 45 42 38 50 30C58 22 62 15 70 15C85 15 85 45 70 45" fill="none" stroke="#6D4C91" strokeLinecap="round" strokeWidth="8"></path>
                                <path d="M50 30C58 38 62 45 70 45" fill="none" stroke="#E5B02E" strokeLinecap="round" strokeWidth="8"></path>
                            </svg>
                            <div className="flex flex-col ml-2 leading-none">
                                <span className="text-brand-purple-light font-bold text-2xl tracking-tight">koneksi</span>
                                <span className="text-brand-purple-light text-[10px] uppercase font-semibold">Panel Administrativo</span>
                            </div>
                        </div>
                    </Link>

                    <div className="flex items-center gap-4 sm:gap-6">
                        {/* Profile Settings */}
                        <button className="flex items-center gap-2 text-slate-600 hover:text-brand-purple-dark transition-colors font-medium">
                            <div className="bg-slate-100 p-2 rounded-full hidden sm:block">
                                <UserIcon className="w-4 h-4" />
                            </div>
                            <span className="text-sm hidden sm:inline-block">Hola, {user?.name || 'Administrador'}</span>
                        </button>

                        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                        {/* Logout */}
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium transition-colors p-2 rounded-lg hover:bg-red-50"
                            title="Cerrar Sesión"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="text-sm hidden sm:inline-block">Salir</span>
                        </button>
                    </div>
                </nav>
            </header>
        </>
    );
}
