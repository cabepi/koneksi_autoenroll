import { Link } from 'react-router-dom';

export default function CentroEnConstruccion() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center py-12">
            <div className="bg-primary/10 text-primary w-24 h-24 rounded-full flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-5xl">construction</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Módulo de Centros de Salud en Construcción
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mb-10 leading-relaxed">
                Estamos trabajando arduamente para habilitar el registro automatizado para clínicas, hospitales y grupos médicos. Esta funcionalidad estará disponible muy pronto.
            </p>

            <Link
                to="/register"
                className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
                <span className="material-symbols-outlined">west</span>
                Volver a la selección de rol
            </Link>
        </div>
    );
}
