import { Link } from 'react-router-dom';

export default function Header() {
    return (
        <>
            {/* Top Info Bar */}
            <div className="bg-brand-purple-dark text-white py-2 px-4 md:px-8 lg:px-16 flex flex-col md:flex-row justify-between items-center text-xs">
                <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8">
                    <a className="flex items-center gap-1 hover:text-brand-yellow transition-colors" href="mailto:servicio@koneksi.com.do">
                        <span className="material-symbols-outlined text-[16px]">mail</span>
                        servicio@koneksi.com.do
                    </a>
                    <span className="flex items-center gap-1 hidden sm:flex">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        Torre Bolivar #195, Av. Simón Bolívar, Sto. Dgo., RD
                    </span>
                    <a className="flex items-center gap-1 hover:text-brand-yellow transition-colors" href="tel:+18092210080">
                        <span className="material-symbols-outlined text-[16px]">call</span>
                        +1 (809) 221-0080
                    </a>
                </div>
                <div className="flex gap-4 mt-2 md:mt-0">
                    <a className="hover:text-brand-yellow transition-colors" href="#"><i className="fab fa-facebook-f text-sm"></i></a>
                    <a className="hover:text-brand-yellow transition-colors" href="#"><i className="fab fa-instagram text-sm"></i></a>
                    <a className="hover:text-brand-yellow transition-colors" href="#"><i className="fab fa-linkedin-in text-sm"></i></a>
                    <a className="hover:text-brand-yellow transition-colors" href="#"><i className="fab fa-twitter text-sm"></i></a>
                </div>
            </div>

            {/* Main Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <nav className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="flex items-center">
                            <svg height="40" viewBox="0 0 100 60" width="40" xmlns="http://www.w3.org/2000/svg">
                                <path d="M30 15C15 15 15 45 30 45C38 45 42 38 50 30C58 22 62 15 70 15C85 15 85 45 70 45" fill="none" stroke="#6D4C91" strokeLinecap="round" strokeWidth="8"></path>
                                <path d="M50 30C58 38 62 45 70 45" fill="none" stroke="#E5B02E" strokeLinecap="round" strokeWidth="8"></path>
                            </svg>
                            <div className="flex flex-col ml-2 leading-none">
                                <span className="text-brand-purple-light font-bold text-2xl tracking-tight">koneksi</span>
                                <span className="text-brand-purple-light text-[10px] uppercase font-semibold">Red Digital de Atención Médica</span>
                            </div>
                        </div>
                    </Link>
                    <div className="hidden xl:flex items-center gap-8 font-semibold text-gray-700">
                        <Link className="hover:text-brand-yellow transition-colors" to="/">Inicio</Link>
                        <a className="hover:text-brand-yellow transition-colors" href="#">Nosotros</a>
                        <a className="hover:text-brand-yellow transition-colors" href="#">Servicios</a>
                        <a className="hover:text-brand-yellow transition-colors" href="#">Prestadores</a>
                        <a className="hover:text-brand-yellow transition-colors" href="#">Contáctanos</a>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6">
                        <Link to="/login" className="hidden sm:block text-brand-yellow font-bold hover:underline cursor-pointer">Iniciar Sesión</Link>
                        <Link to="/register" className="bg-brand-yellow text-white px-4 sm:px-8 py-2 rounded-md font-bold hover:bg-opacity-90 transition-all shadow-md text-sm sm:text-base">Registrarse</Link>
                    </div>
                </nav>
            </header>
        </>
    );
}
