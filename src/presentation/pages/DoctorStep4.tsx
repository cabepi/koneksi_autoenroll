import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RegistrationStepper from '../components/RegistrationStepper.js';
import { TeamMember, MedicalCenter, ProviderArsRelation, MedicalSpecialty } from '../../domain/types';

interface ProfessionalData {
    cedula: string;
    nombreCompleto: string;
    exequatur: string;
    fechaRegistro: string;
    selectedSpecialties: MedicalSpecialty[];
    email: string;
    isEmailVerified: boolean;
    telefono: string;
    biometricImageUrl: string | null;
}

// Color palette for team member avatars
const PASTEL_COLORS = [
    'bg-amber-100 text-amber-600',
    'bg-teal-100 text-teal-600',
    'bg-rose-100 text-rose-600',
    'bg-indigo-100 text-indigo-600',
    'bg-lime-100 text-lime-600',
    'bg-fuchsia-100 text-fuchsia-600',
];

function getInitials(nombre: string, apellido: string): string {
    return `${(nombre?.[0] || '').toUpperCase()}${(apellido?.[0] || '').toUpperCase()}`;
}

export default function DoctorStep4() {
    const [professionalData, setProfessionalData] = useState<ProfessionalData | null>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [medicalCenters, setMedicalCenters] = useState<MedicalCenter[]>([]);
    const [arsRecords, setArsRecords] = useState<ProviderArsRelation[]>([]);
    const [isCertified, setIsCertified] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Step 1: Professional data
        const rawStep1 = localStorage.getItem('koneksi_registration_step2');
        if (rawStep1) {
            try { setProfessionalData(JSON.parse(rawStep1)); } catch { /* ignore */ }
        }

        // Step 2: Team members
        const rawTeam = localStorage.getItem('koneksi_team_members');
        if (rawTeam) {
            try { setTeamMembers(JSON.parse(rawTeam)); } catch { /* ignore */ }
        }

        // Step 2: Medical centers
        const rawCenters = localStorage.getItem('koneksi_selected_centers');
        if (rawCenters) {
            try { setMedicalCenters(JSON.parse(rawCenters)); } catch { /* ignore */ }
        }

        // Step 3: ARS providers
        const rawArs = localStorage.getItem('koneksi_ars_providers');
        if (rawArs) {
            try { setArsRecords(JSON.parse(rawArs)); } catch { /* ignore */ }
        }
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-background-light text-slate-900 font-sans">
            <RegistrationStepper currentStep={4} />

            <main className="max-w-[900px] mx-auto my-10 px-5 w-full">
                {/* Page Header */}
                <section className="text-center mb-10">
                    <h1 className="text-3xl font-bold mb-3">Revisión Final y Confirmación</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Por favor, revise su información cuidadosamente. Estos datos se utilizarán para verificar sus credenciales médicas.
                    </p>
                </section>

                {/* 1. Datos Profesionales */}
                <section className="bg-white border text-left border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3 text-brand-yellow">
                            <span className="material-symbols-outlined text-2xl">account_circle</span>
                            <h2 className="text-xl font-bold text-slate-900">1. Datos Profesionales</h2>
                        </div>
                        <Link to="/register/doctor-step-1" className="text-brand-yellow font-medium flex items-center gap-1 hover:underline">
                            <span className="material-symbols-outlined text-sm">edit</span> Editar
                        </Link>
                    </div>
                    {professionalData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 border-t border-gray-50 pt-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Nombre Completo</label>
                                <p className="text-base font-semibold">{professionalData.nombreCompleto || '—'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Cédula</label>
                                <p className="text-base font-semibold font-mono">{professionalData.cedula || '—'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Exequátur</label>
                                <p className="text-base font-semibold uppercase">{professionalData.exequatur || '—'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Fecha de Registro</label>
                                <p className="text-base font-semibold">{professionalData.fechaRegistro || '—'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Especialidad(es) Médica(s)</label>
                                {professionalData.selectedSpecialties && professionalData.selectedSpecialties.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {professionalData.selectedSpecialties.map((sp) => (
                                            <span key={sp.slug} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">{sp.fallback_name}</span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-base font-semibold text-slate-400">—</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Correo Electrónico</label>
                                <div className="flex items-center gap-2">
                                    <p className="text-base font-semibold">{professionalData.email || '—'}</p>
                                    {professionalData.isEmailVerified && (
                                        <span className="material-symbols-outlined text-green-500 text-lg">verified</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Número de Teléfono</label>
                                <p className="text-base font-semibold">{professionalData.telefono ? `+1 ${professionalData.telefono}` : '—'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Verificación Biométrica</label>
                                {professionalData.biometricImageUrl ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-400">
                                            <img src={professionalData.biometricImageUrl} alt="Biometría" className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-green-600 text-sm font-bold flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                            Completada
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-base font-semibold text-slate-400">No completada</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-400 text-center py-4 border-t border-gray-50">No se han ingresado datos profesionales aún.</p>
                    )}
                </section>

                {/* 2. Equipo y Centros Médicos */}
                <section className="bg-white border border-gray-200 text-left rounded-xl p-6 mb-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3 text-brand-yellow">
                            <span className="material-symbols-outlined text-2xl">local_hospital</span>
                            <h2 className="text-xl font-bold text-slate-900">2. Equipo y Centros Médicos</h2>
                        </div>
                        <Link to="/register/doctor-step-2" className="text-brand-yellow font-medium flex items-center gap-1 hover:underline">
                            <span className="material-symbols-outlined text-sm">edit</span> Editar
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Team Members */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Equipo Médico</h3>
                            {teamMembers.length > 0 ? (
                                <div className="space-y-3">
                                    {teamMembers.map((member, idx) => (
                                        <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${PASTEL_COLORS[idx % PASTEL_COLORS.length]}`}>
                                                {getInitials(member.nombre, member.apellido)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{member.nombre} {member.apellido}</p>
                                                <p className="text-xs text-gray-400">{member.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400">No se han agregado miembros de equipo.</p>
                            )}
                        </div>
                        {/* Medical Centers */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Centros Médicos Vinculados</h3>
                            {medicalCenters.length > 0 ? (
                                <div className="space-y-3">
                                    {medicalCenters.map((center) => (
                                        <div key={center.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                            <div className="text-brand-yellow">
                                                <span className="material-symbols-outlined">apartment</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{center.name}</p>
                                                <p className="text-xs text-gray-400">{center.city || center.province || ''}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400">No se han vinculado centros médicos.</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* 3. Códigos de Seguro (ARS) */}
                <section className="bg-white border text-left border-gray-200 rounded-xl p-6 mb-4 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3 text-brand-yellow">
                            <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                            <h2 className="text-xl font-bold text-slate-900">3. Códigos de Seguro</h2>
                        </div>
                        <Link to="/register/doctor-step-3" className="text-brand-yellow font-medium flex items-center gap-1 hover:underline">
                            <span className="material-symbols-outlined text-sm">edit</span> Editar
                        </Link>
                    </div>
                    {arsRecords.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-1/3">Proveedor ARS</th>
                                        <th className="py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-1/3">ID / Código del Proveedor</th>
                                        <th className="py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-1/3">PIN</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {arsRecords.map((ars) => (
                                        <tr key={ars.arsCode}>
                                            <td className="py-5 font-bold text-gray-800">{ars.arsName}</td>
                                            <td className="py-5 text-gray-600 font-mono">{ars.providerCode}</td>
                                            <td className="py-5 text-gray-600 font-mono">{'•'.repeat(ars.pin.length)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-slate-400 text-center py-4 border-t border-gray-50">No se han asociado ARS. Este paso es opcional.</p>
                    )}
                </section>

                {/* Final Confirmation */}
                <section className="bg-white border border-gray-200 rounded-xl p-8 mb-6 mt-6 text-left">
                    <div className="flex items-start gap-4 mb-10">
                        <div className="flex items-center h-5 mt-1">
                            <input
                                className="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                id="certify"
                                name="certify"
                                type="checkbox"
                                checked={isCertified}
                                onChange={(e) => setIsCertified(e.target.checked)}
                            />
                        </div>
                        <div className="text-sm md:text-base leading-relaxed text-gray-800">
                            <label className="cursor-pointer" htmlFor="certify">
                                Por la presente certifico que la información proporcionada arriba es precisa y veraz. Estoy de acuerdo con el <a className="text-brand-yellow font-semibold hover:underline" href="#">Contrato de Servicios y Uso</a> y la <a className="text-brand-yellow font-semibold hover:underline" href="#">Política de Privacidad</a> de KONEKSI y autorizo la verificación de mis credenciales médicas.
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-center mb-8">
                        <button
                            disabled={!isCertified || isSubmitting}
                            onClick={async () => {
                                if (!professionalData) return;
                                setIsSubmitting(true);
                                try {
                                    const response = await fetch('/api/enrollment-requests', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            identificationNumber: professionalData.cedula,
                                            fullName: professionalData.nombreCompleto,
                                            medicalLicense: professionalData.exequatur,
                                            registrationDate: professionalData.fechaRegistro,
                                            specialties: professionalData.selectedSpecialties,
                                            email: professionalData.email,
                                            emailVerified: professionalData.isEmailVerified,
                                            phone: professionalData.telefono,
                                            biometricImageBase64: professionalData.biometricImageUrl,
                                            teamMembers,
                                            medicalCenters,
                                            arsProviders: arsRecords,
                                        }),
                                    });
                                    if (response.ok) {
                                        // Clear registration data from browser context upon success
                                        localStorage.removeItem('koneksi_registration_step2');
                                        localStorage.removeItem('koneksi_team_members');
                                        localStorage.removeItem('koneksi_selected_centers');
                                        localStorage.removeItem('koneksi_ars_providers');

                                        navigate('/register/enrollment-success');
                                    } else {
                                        alert('Error al enviar la solicitud. Por favor intente nuevamente.');
                                    }
                                } catch (err) {
                                    console.error('Enrollment submission error:', err);
                                    alert('Error de conexión. Por favor intente nuevamente.');
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            className={`w-full max-w-xl font-bold py-5 px-8 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-md ${isCertified && !isSubmitting
                                ? 'bg-brand-yellow hover:bg-[#d49a20] text-white'
                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                }`}
                            type="button"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                                    <span className="text-lg">Enviando...</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-lg">Completar Registro</span>
                                    <span className="material-symbols-outlined">check_circle</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-normal">
                            Su perfil será revisado por nuestro sistema, y de ser requerido nuestro equipo de cumplimiento estará revisando la solicitud. La revisión manual generalmente toma de 24 a 48 horas hábiles.
                        </p>
                    </div>
                </section>

                <div className="flex items-center justify-start mt-6 mb-10">
                    <Link to="/register/doctor-step-3" className="flex items-center gap-2 text-brand-purple font-bold hover:underline">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Volver
                    </Link>
                </div>

            </main>
        </div>
    );
}
