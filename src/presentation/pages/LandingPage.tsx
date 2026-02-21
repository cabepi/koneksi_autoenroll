import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <>
            {/* Hero Section */}
            <main className="relative bg-background-light overflow-hidden min-h-[600px] flex items-center">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16 w-full grid grid-cols-1 lg:grid-cols-12 items-center gap-12 py-16">
                    <div className="lg:col-span-6 z-10">
                        <p className="text-brand-yellow font-bold uppercase tracking-wider text-sm mb-6">Nuestro Propósito Principal</p>
                        <h1 className="font-serif text-5xl md:text-7xl text-gray-800 mb-8 leading-[1.1]">
                            Conectar Toda La Red De Salud
                        </h1>
                        <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
                            Es conectar a los profesionales médicos, proveedores de servicios de salud y las ARS/Aseguradoras a través de un conjunto de herramientas que permitan gestionar las autorizaciones médicas de forma digital.
                        </p>
                        <Link to="/nosotros" className="inline-block bg-brand-yellow text-white px-10 py-3 rounded-md font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg">
                            Ver Más
                        </Link>
                    </div>
                    <div className="lg:col-span-6 flex justify-end items-center relative h-full min-h-[400px]">
                        <img
                            alt="Hands holding a red heart"
                            className="w-full h-auto object-cover rounded-2xl shadow-2xl"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7CHUR4YKHLTatCfzOwZJlB8wa-ph2gxAFfVm_70tHs0_a7z5DJ8Yn2etAVPfxCCPM9f_Yt5Cr48RCJaQj4CRm28eUsO4yfy8TQpLXCRHnKrdy0MTwX7rjOo6ju0Ew1G7AZw7yedz2t16W0cHELy2O0AJLNMusWR2Cm1ogrZRP59kBAUWGPGzOEYa4z0OWZh3ztMDzkD7KqLC3Kl0UURVyGbzDq8IQFjJJuJJHDYzSTddDlZ38VLfk5Gq21YNyYa-b9faXXwG6F4g"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-background-light via-transparent to-transparent hidden lg:block"></div>
                    </div>
                </div>
            </main>

            {/* Connection Section */}
            <section className="py-20 bg-white">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16">
                    <div className="text-center mb-16">
                        <p className="text-brand-yellow font-bold uppercase tracking-wider text-sm mb-2">Bienvenidos a KONEKSI</p>
                        <h2 className="font-serif text-4xl md:text-5xl text-gray-800 mb-4 font-bold">¡Queremos conectarnos contigo!</h2>
                        <p className="text-gray-600 text-lg">y juntos formar la mayor red del Sector Salud en la República Dominicana.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Circular Graphic Alternative / Map */}
                        <div className="relative flex justify-center items-center h-[500px] w-full max-w-[500px] mx-auto shrink-0">
                            {/* Transcribing the circle layout roughly */}
                            <div className="z-10 bg-white p-4 rounded-full shadow-sm">
                                <div className="flex flex-col items-center">
                                    <svg height="50" viewBox="0 0 100 60" width="80" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M30 15C15 15 15 45 30 45C38 45 42 38 50 30C58 22 62 15 70 15C85 15 85 45 70 45" fill="none" stroke="#6D4C91" strokeLinecap="round" strokeWidth="8"></path>
                                        <path d="M50 30C58 38 62 45 70 45" fill="none" stroke="#E5B02E" strokeLinecap="round" strokeWidth="8"></path>
                                    </svg>
                                    <span className="text-brand-purple-light font-bold text-xl leading-none tracking-tight">koneksi</span>
                                    <span className="text-brand-purple-light text-[8px] uppercase font-semibold text-center mt-1">Red Digital de <br /> Atención Médica</span>
                                </div>
                            </div>

                            {/* Simulated Nodes positioned around */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                <span className="text-[10px] font-bold text-gray-500 mb-1">Personal Médico</span>
                                <div className="w-16 h-16 bg-brand-purple-light rounded-full flex items-center justify-center text-white shadow-lg"><i className="fas fa-user-md text-2xl"></i></div>
                            </div>
                            <div className="absolute top-[10%] right-[10%] flex flex-col items-center">
                                <span className="text-[10px] font-bold text-gray-500 mb-1">Aseguradoras</span>
                                <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center text-white shadow-lg"><i className="fas fa-building text-2xl"></i></div>
                            </div>
                            <div className="absolute top-1/2 right-0 -translate-y-1/2 flex flex-col items-center translate-x-1/2">
                                <span className="text-[10px] font-bold text-gray-500 mb-1">CAP - UNAP</span>
                                <div className="w-16 h-16 bg-brand-purple-light rounded-full flex items-center justify-center text-white shadow-lg"><i className="fas fa-hospital-alt text-2xl"></i></div>
                            </div>
                            <div className="absolute bottom-[10%] right-[10%] flex flex-col items-center">
                                <span className="text-[10px] font-bold text-gray-500 mt-1 order-last">Laboratorios</span>
                                <div className="w-16 h-16 bg-red-700 rounded-full flex items-center justify-center text-white shadow-lg"><i className="fas fa-flask text-2xl"></i></div>
                            </div>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                <span className="text-[10px] font-bold text-gray-500 mt-1 order-last">Centros Diagnósticos</span>
                                <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center text-white shadow-lg"><i className="fas fa-heartbeat text-2xl"></i></div>
                            </div>
                            <div className="absolute bottom-[10%] left-[10%] flex flex-col items-center">
                                <span className="text-[10px] font-bold text-gray-500 mt-1 order-last">Pacientes</span>
                                <div className="w-16 h-16 bg-brand-purple-light rounded-full flex items-center justify-center text-white shadow-lg"><i className="fas fa-users text-2xl"></i></div>
                            </div>
                            <div className="absolute top-1/2 left-0 -translate-y-1/2 flex flex-col items-center -translate-x-1/2">
                                <span className="text-[10px] font-bold text-gray-500 mb-1">Farmacias</span>
                                <div className="w-16 h-16 bg-red-700 rounded-full flex items-center justify-center text-white shadow-lg"><i className="fas fa-pills text-2xl"></i></div>
                            </div>
                            <div className="absolute top-[10%] left-[10%] flex flex-col items-center">
                                <span className="text-[10px] font-bold text-gray-500 mb-1">Clínicas</span>
                                <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center text-white shadow-lg"><i className="fas fa-clinic-medical text-2xl"></i></div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-serif text-4xl text-gray-800 mb-6 font-bold leading-tight">
                                Nuestra Meta Es Integrar Todo El Sistema de Salud
                            </h3>
                            <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                Nuestra pasión por la innovación y la tecnología nos llevó a desarrollar una red digital de atención médica que conecta a los profesionales médicos, proveedores de salud y las ARS Por vía de una plataforma digital que permite automatizar las operaciones de gestión médica, gestionar la validación de afiliación y autorización de reclamaciones, conectando de manera directa con las ARS, manteniendo un registro de las transacciones para ser radicadas electrónicamente.
                            </p>
                            <Link to="/acerca-de" className="inline-block bg-brand-yellow text-white px-10 py-3 rounded-md font-bold text-lg hover:bg-opacity-90 transition-all shadow-md">
                                Conocer Más
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-20 bg-white border-t border-gray-100">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16">
                    <div className="text-center mb-16">
                        <p className="text-brand-yellow font-bold uppercase tracking-wider text-sm mb-2">Servicios Principales</p>
                        <h2 className="font-serif text-4xl md:text-5xl text-gray-800 font-bold mb-4">Algunos De Los Servicios Que Ofrecemos</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="border-2 border-dashed border-brand-yellow/30 p-8 flex flex-col items-center text-center rounded-lg hover:shadow-xl transition-shadow">
                            <div className="mb-6">
                                <svg fill="none" height="60" stroke="#E5B02E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="60"><rect height="14" rx="2" ry="2" width="18" x="3" y="4"></rect><line x1="7" x2="11" y1="8" y2="8"></line><line x1="7" x2="10" y1="12" y2="12"></line><path d="M14 8h3v4h-3z"></path></svg>
                            </div>
                            <h3 className="font-serif text-2xl text-gray-800 mb-4 font-bold">EHR</h3>
                            <p className="text-gray-600 mb-6">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.</p>
                            <a className="text-gray-800 font-bold hover:text-brand-yellow transition-colors" href="#">Read More</a>
                        </div>
                        <div className="border-2 border-dashed border-brand-yellow/30 p-8 flex flex-col items-center text-center rounded-lg hover:shadow-xl transition-shadow">
                            <div className="mb-6">
                                <svg fill="none" height="60" stroke="#E5B02E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="60"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" x2="8" y1="13" y2="13"></line><line x1="16" x2="8" y1="17" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            </div>
                            <h3 className="font-serif text-2xl text-gray-800 mb-4 font-bold">Autorizaciones Médicas</h3>
                            <p className="text-gray-600 mb-6">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.</p>
                            <a className="text-gray-800 font-bold hover:text-brand-yellow transition-colors" href="#">Read More</a>
                        </div>
                        <div className="border-2 border-dashed border-brand-yellow/30 p-8 flex flex-col items-center text-center rounded-lg hover:shadow-xl transition-shadow">
                            <div className="mb-6">
                                <svg fill="none" height="60" stroke="#E5B02E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="60"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle><path d="M12 5V3"></path><path d="M12 21v-2"></path><path d="m18.35 18.35 1.45 1.45"></path><path d="m4.2 4.2 1.45 1.45"></path><path d="M21 12h-2"></path><path d="M5 12H3"></path><path d="m18.35 5.65 1.45-1.45"></path><path d="m4.2 19.8 1.45-1.45"></path></svg>
                            </div>
                            <h3 className="font-serif text-2xl text-gray-800 mb-4 font-bold">Validación Biométrica</h3>
                            <p className="text-gray-600 mb-6">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.</p>
                            <a className="text-gray-800 font-bold hover:text-brand-yellow transition-colors" href="#">Read More</a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
