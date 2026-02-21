import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Register() {
    const [selectedRole, setSelectedRole] = useState<'medico' | 'centro' | null>(null);

    useEffect(() => {
        const savedRole = localStorage.getItem('koneksi_role');
        if (savedRole === 'medico' || savedRole === 'centro') {
            setSelectedRole(savedRole);
        }
    }, []);

    useEffect(() => {
        if (selectedRole) {
            localStorage.setItem('koneksi_role', selectedRole);
        } else {
            localStorage.removeItem('koneksi_role');
        }
    }, [selectedRole]);

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pt-6 lg:pt-12 bg-background-light font-display">
            {/* We use absolute positioning for the inner header on this specific screen if we want to mimic it exactly,
          but using our global Header is better for consistency. Our global Header is in standard layout flow. Let's make it fixed 
          if we were to adapt the exact design, however the html has a top nav bar inside a div.
          I'll just inject a custom header block that matches "Registro Koneksi" close button style, or use standard Header. 
          Given the design, it's a dedicated slim header. */}

            <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:px-20">
                <div className="max-w-[800px] w-full text-center space-y-4 mb-12">
                    <h1 className="text-slate-900 text-3xl md:text-4xl font-bold leading-tight">
                        ¿Cómo estarás utilizando la plataforma?
                    </h1>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
                        Elija la opción que mejor describa su práctica para ayudarnos a personalizar su experiencia con las herramientas y estándares de cumplimiento adecuados.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                    <button
                        onClick={() => setSelectedRole('medico')}
                        className={`group flex flex-col items-start p-8 rounded-xl bg-white border-2 transition-all text-left shadow-sm hover:shadow-md ${selectedRole === 'medico'
                            ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                            : 'border-slate-200 hover:border-primary/50'
                            }`}
                    >
                        <div className={`size-14 rounded-full flex items-center justify-center mb-6 transition-transform ${selectedRole === 'medico' ? 'bg-primary text-white scale-110' : 'bg-primary/10 text-primary group-hover:scale-110'
                            }`}>
                            <span className="material-symbols-outlined text-3xl">stethoscope</span>
                        </div>
                        <h3 className="text-slate-900 text-xl font-bold mb-3">Médico</h3>
                        <p className="text-slate-600 text-base leading-relaxed">
                            Soy un médico independiente, practicante solitario o especialista que gestiona su propia práctica.
                        </p>
                    </button>

                    <button
                        onClick={() => setSelectedRole('centro')}
                        className={`group flex flex-col items-start p-8 rounded-xl bg-white border-2 transition-all text-left shadow-sm hover:shadow-md ${selectedRole === 'centro'
                            ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                            : 'border-slate-200 hover:border-primary/50'
                            }`}
                    >
                        <div className={`size-14 rounded-full flex items-center justify-center mb-6 transition-transform ${selectedRole === 'centro' ? 'bg-primary text-white scale-110' : 'bg-primary/10 text-primary group-hover:scale-110'
                            }`}>
                            <span className="material-symbols-outlined text-3xl">apartment</span>
                        </div>
                        <h3 className="text-slate-900 text-xl font-bold mb-3">Centro de Salud</h3>
                        <p className="text-slate-600 text-base leading-relaxed">
                            Represento a una clínica, hospital, grupo multi-especialidad o institución de salud.
                        </p>
                    </button>
                </div>
            </main>

            <footer className="mt-auto border-t border-slate-200 px-6 py-6 md:px-20 lg:px-40 bg-white">
                <div className="max-w-[960px] mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-slate-600 font-medium hover:text-slate-900 transition-colors">
                        <span className="material-symbols-outlined">west</span>
                        Cancelar
                    </Link>
                    <Link
                        to={selectedRole === 'medico' ? "/register/doctor-step-1" : selectedRole === 'centro' ? "/register/centro-construccion" : "#"}
                        className={`flex items-center gap-2 px-8 py-3 font-bold rounded-xl transition-all shadow-lg ${selectedRole
                            ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                            }`}
                        onClick={(e) => {
                            if (!selectedRole) e.preventDefault();
                        }}
                    >
                        Iniciar Registro
                        <span className="material-symbols-outlined">east</span>
                    </Link>
                </div>
            </footer>
        </div>
    );
}
