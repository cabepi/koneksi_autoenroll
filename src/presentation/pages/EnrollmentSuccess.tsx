import { useEffect, useState } from 'react';

export default function EnrollmentSuccess() {
    const [doctorName, setDoctorName] = useState('');

    useEffect(() => {
        const rawStep1 = localStorage.getItem('koneksi_registration_step2');
        if (rawStep1) {
            try {
                const parsed = JSON.parse(rawStep1);
                // Extract first name for the greeting
                const fullName = parsed.nombreCompleto || '';
                const firstName = fullName.split(' ')[0];
                setDoctorName(firstName);
            } catch { /* ignore */ }
        }
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-background-light text-slate-900 font-sans">
            <main className="max-w-[700px] mx-auto my-10 px-5 w-full flex flex-col items-center">
                {/* Success Icon */}
                <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center mb-8 shadow-lg shadow-green-100/50">
                    <div className="w-20 h-20 rounded-full bg-green-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-green-600 text-5xl">check_circle</span>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center">
                    ¡Enrolamiento completo{doctorName ? `, Dr. ${doctorName}` : ''}!
                </h1>
                <p className="text-gray-500 text-center max-w-lg leading-relaxed mb-10">
                    Gracias por completar su perfil. Nuestro equipo de credenciales médicas ha recibido su solicitud y ha comenzado el proceso de verificación. Normalmente completamos las revisiones en un plazo de 2 días hábiles.
                </p>

                {/* Next Steps Card */}
                <div className="w-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-brand-yellow text-xl">verified_user</span>
                        <h2 className="text-lg font-bold text-slate-900">Próximos pasos</h2>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        Actualmente estamos verificando los datos suministrados para garantizarle una experiencia única. Recibirá una notificación por correo electrónico automática una vez que se le otorgue el acceso completo a nuestra plataforma.
                    </p>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                        <span className="text-sm text-gray-500">Estado de la solicitud</span>
                        <span className="px-4 py-1.5 bg-amber-50 text-amber-600 text-xs font-bold tracking-wider rounded-full flex items-center gap-1.5 border border-amber-200">
                            <span className="material-symbols-outlined text-sm">pending</span>
                            PENDIENTE
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mb-8">
                    <a
                        href="/api/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-3 border border-gray-200 bg-white text-slate-700 font-bold py-4 px-6 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined text-brand-yellow">description</span>
                        Ver Condiciones de Uso
                    </a>
                    <button className="flex-1 flex items-center justify-center gap-3 bg-accent-purple/10 text-accent-purple font-bold py-4 px-6 rounded-xl hover:bg-accent-purple/20 transition-colors border border-accent-purple/20">
                        <span className="material-symbols-outlined">arrow_forward</span>
                        Ir al EHR
                    </button>
                </div>

                {/* Support Link */}
                <p className="text-gray-400 text-sm">
                    ¿Necesita asistencia inmediata?{' '}
                    <a href="#" className="text-brand-yellow font-semibold hover:underline">Contactar al equipo de soporte</a>
                </p>
            </main>
        </div>
    );
}
