import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';

import { MedicalSpecialty, TeamMember, MedicalCenter, ProviderArsRelation } from '../../domain/types';
import CameraModal from '../components/CameraModal';
import AddTeamMemberModal from '../components/AddTeamMemberModal';
import AddArsModal from '../components/AddArsModal';

export default function AdjustRequest() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form Data State
    const [cedula, setCedula] = useState('');
    const [nombreCompleto, setNombreCompleto] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [medicalLicense, setMedicalLicense] = useState('');
    const [specialties, setSpecialties] = useState<MedicalSpecialty[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [medicalCenters, setMedicalCenters] = useState<MedicalCenter[]>([]);
    const [arsProviders, setArsProviders] = useState<ProviderArsRelation[]>([]);
    const [biometricImageUrl, setBiometricImageUrl] = useState<string | null>(null);
    const [biometricImageBase64, setBiometricImageBase64] = useState<string | null>(null);

    // Modals & UI State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [isAddArsModalOpen, setIsAddArsModalOpen] = useState(false);

    // Specialties Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [options, setOptions] = useState<MedicalSpecialty[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Centers Search State
    const [centerSearchQuery, setCenterSearchQuery] = useState('');
    const [centerSearchResults, setCenterSearchResults] = useState<MedicalCenter[]>([]);
    const [isSearchingCenters, setIsSearchingCenters] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/enrollment-requests/${id}`);
                if (!response.ok) throw new Error('No pudimos cargar la solicitud');
                const data = await response.json();

                const rawCedula = data.identification_number ? data.identification_number.replace(/\D/g, '') : '';
                const fmtCedula = rawCedula.length === 11 ? `${rawCedula.slice(0, 3)}-${rawCedula.slice(3, 10)}-${rawCedula.slice(10)}` : rawCedula;

                setCedula(fmtCedula);
                setNombreCompleto(data.full_name || '');
                setEmail(data.email || '');
                setPhone(data.phone || '');
                setMedicalLicense(data.medical_license || '');
                setSpecialties(data.specialties || []);
                setTeamMembers(data.team_members || []);
                setMedicalCenters(data.medical_centers || []);
                setArsProviders(data.ars_providers || []);
                setBiometricImageUrl(data.biometric_image_url || null);
            } catch (err: any) {
                setError(err.message || 'Error de conexión');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    // --- Specialties Search Logic ---
    useEffect(() => {
        if (searchQuery.length < 4) {
            setOptions([]);
            setShowOptions(false);
            return;
        }

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await fetch(`/api/specialties?q=${encodeURIComponent(searchQuery)}`);
                if (response.ok) {
                    const data = await response.json();
                    setOptions(data);
                    setShowOptions(true);
                }
            } catch (err) {
                console.error("Error searching specialties", err);
            } finally {
                setIsSearching(false);
            }
        }, 400);

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [searchQuery]);

    const handleSelectSpecialty = (sp: MedicalSpecialty) => {
        if (!specialties.find(s => s.slug === sp.slug)) {
            setSpecialties([...specialties, sp]);
        }
        setSearchQuery("");
        setOptions([]);
        setShowOptions(false);
    };

    const handleRemoveSpecialty = (slug: string) => {
        setSpecialties(specialties.filter(s => s.slug !== slug));
    };

    // --- Medical Centers Search Logic ---
    useEffect(() => {
        if (centerSearchQuery.length < 4) {
            setCenterSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearchingCenters(true);
            try {
                const response = await fetch(`/api/medical-centers?q=${encodeURIComponent(centerSearchQuery)}`);
                if (response.ok) {
                    const data = await response.json();
                    setCenterSearchResults(data);
                } else {
                    setCenterSearchResults([]);
                }
            } catch (error) {
                setCenterSearchResults([]);
            } finally {
                setIsSearchingCenters(false);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [centerSearchQuery]);

    const handleSelectCenter = (center: MedicalCenter) => {
        if (!medicalCenters.find(c => c.id === center.id)) {
            setMedicalCenters([...medicalCenters, center]);
        }
        setCenterSearchQuery('');
        setCenterSearchResults([]);
    };

    const handleRemoveCenter = (id: number) => {
        setMedicalCenters(medicalCenters.filter(c => c.id !== id));
    };

    // --- Others Handlers ---
    const handleAddTeamMember = (member: TeamMember) => {
        setTeamMembers([...teamMembers, { ...member, id: Date.now() }]);
        setIsAddMemberModalOpen(false);
    };

    const handleRemoveMember = (id: number) => {
        setTeamMembers(teamMembers.filter(m => m.id !== id));
    };

    const handleSaveArs = (arsRelation: ProviderArsRelation) => {
        if (!arsProviders.find(r => r.arsCode === arsRelation.arsCode)) {
            setArsProviders([...arsProviders, arsRelation]);
        }
    };

    const handleRemoveArs = (arsCode: string) => {
        setArsProviders(arsProviders.filter(r => r.arsCode !== arsCode));
    };

    const formatTelefono = (value: string) => {
        const numbers = value.replace(/\D/g, '').slice(0, 10);
        if (numbers.length === 0) return '';
        if (numbers.length <= 3) return `(${numbers}`;
        if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
        return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const payload = {
                identificationNumber: cedula,
                fullName: nombreCompleto,
                medicalLicense,
                specialties,
                email,
                phone,
                teamMembers,
                medicalCenters,
                arsProviders,
                biometricImageBase64: biometricImageBase64 ? biometricImageBase64 : undefined
            };

            const response = await fetch(`/api/enrollment-requests/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const resData = await response.json();
                throw new Error(resData.error || 'Hubo un error al guardar los cambios.');
            }

            navigate(`/doctor-enrollment-status/${id}`);
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado al actualizar la solicitud.');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className="mt-4 text-gray-600">Cargando datos de la solicitud...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-slate-800 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-purple-600 hover:text-purple-800 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver
                    </button>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Ajuste de Solicitud de Enrolamiento</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Modifica los datos observados. Algunos campos de identidad son de solo lectura por seguridad.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                        <div className="flex">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Identidad */}
                    <section className="bg-white px-6 py-8 border border-gray-200 rounded-xl shadow-sm">
                        <h2 className="text-xl font-semibold mb-6 text-gray-900 border-b pb-2">Identidad del Profesional</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cédula</label>
                                <input type="text" disabled className="mt-1 bg-gray-100 block w-full rounded-md border-gray-300 py-2.5 px-3 focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-gray-500 cursor-not-allowed" value={cedula} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre Completo según JCE</label>
                                <input type="text" disabled className="mt-1 bg-gray-100 block w-full rounded-md border-gray-300 py-2.5 px-3 focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-gray-500 cursor-not-allowed" value={nombreCompleto} />
                            </div>
                        </div>
                        
                        <div className="mt-8">
                            <label className="text-sm font-semibold text-slate-700 block mb-4">Captura Biométrica (Obligatorio)</label>
                            {biometricImageUrl || biometricImageBase64 ? (
                                <div className="border border-green-200 bg-green-50 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-lg bg-green-100 flex items-center justify-center overflow-hidden border border-green-200">
                                            {biometricImageBase64 ? (
                                               <img src={biometricImageBase64} alt="Biometría nueva" className="w-full h-full object-cover" />
                                            ) : (
                                               <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-green-800">Verificación biométrica registrada</p>
                                            <p className="text-xs text-green-600">Puede volver a capturar si la foto actual fue observada.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsCameraOpen(true)}
                                        className="text-primary font-bold text-sm bg-white border border-primary px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors"
                                    >
                                        Volver a Capturar
                                    </button>
                                </div>
                            ) : (
                                <div className="border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-4 bg-slate-50">
                                    <span className="material-symbols-outlined text-4xl text-slate-400">face</span>
                                    <p className="text-slate-600 max-w-sm">No hay foto biométrica. Tome una foto con buena iluminación frente a su dispositivo.</p>
                                    <button
                                        type="button"
                                        onClick={() => setIsCameraOpen(true)}
                                        className="bg-brand-purple-dark hover:bg-brand-purple-dark/90 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined">camera_alt</span>
                                        Abrir Cámara
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Profesional y Contacto */}
                    <section className="bg-white px-6 py-8 border border-gray-200 rounded-xl shadow-sm">
                        <h2 className="text-xl font-semibold mb-6 text-gray-900 border-b pb-2">Información Profesional y Contacto</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Exequátur</label>
                                <input type="text" value={medicalLicense} onChange={(e) => setMedicalLicense(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border py-2.5 px-3" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border py-2.5 px-3" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                <input type="tel" value={phone} onChange={(e) => setPhone(formatTelefono(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm border py-2.5 px-3" required />
                            </div>
                            
                            <div className="sm:col-span-2">
                                <label className="text-sm font-semibold text-slate-700">Especialidades</label>
                                {specialties.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2 mt-2">
                                        {specialties.map((sp) => (
                                            <span key={sp.slug} className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                                                {sp.fallback_name}
                                                <button type="button" className="text-xs hover:text-red-500 flex" onClick={() => handleRemoveSpecialty(sp.slug)}>
                                                    &times;
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="relative mt-2">
                                    <input
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-purple-500 outline-none sm:text-sm"
                                        type="text"
                                        placeholder="Buscar especialidad (min. 4 letras)..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => { if (options.length > 0) setShowOptions(true); }}
                                    />
                                    {showOptions && options.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                            {options.map((option) => (
                                                <div key={option.slug} className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm" onClick={() => handleSelectSpecialty(option)}>
                                                    {option.fallback_name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {showOptions && <div className="fixed inset-0 z-0" onClick={() => setShowOptions(false)}></div>}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Centros de Salud */}
                    <section className="bg-white px-6 py-8 border border-gray-200 rounded-xl shadow-sm">
                        <h2 className="text-xl font-semibold mb-6 text-gray-900 border-b pb-2">Centros de Salud</h2>
                        <div className="relative mb-4">
                            <input
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                                type="text"
                                placeholder="Buscar en el catálogo (Ej: Clinica Abreu)..."
                                value={centerSearchQuery}
                                onChange={(e) => setCenterSearchQuery(e.target.value)}
                            />
                            {isSearchingCenters && <div className="absolute inset-y-0 right-4 flex items-center"><span className="animate-spin">⌛</span></div>}
                            
                            {centerSearchResults.length > 0 && centerSearchQuery.length >= 4 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {centerSearchResults.map((center) => (
                                        <div key={center.id} className="p-4 hover:bg-slate-50 cursor-pointer text-sm border-b" onClick={() => handleSelectCenter(center)}>
                                            <div className="font-bold text-slate-800">{center.name}</div>
                                            <div className="text-xs text-slate-500 capitalize">{center.province} • {center.city}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {medicalCenters.length > 0 ? (
                            <div className="divide-y border rounded-lg">
                                {medicalCenters.map(center => (
                                    <div key={center.id} className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-sm">{center.name}</p>
                                            <p className="text-xs text-gray-500">{center.address || center.province}</p>
                                        </div>
                                        <button type="button" onClick={() => handleRemoveCenter(center.id)} className="text-red-500 hover:bg-red-50 p-2 rounded text-sm font-semibold">Eliminar</button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 border rounded-lg p-4 text-center bg-gray-50">No hay centros vinculados.</p>
                        )}
                    </section>
                    
                    {/* Personal de Apoyo */}
                    <section className="bg-white px-6 py-8 border border-gray-200 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-6 border-b pb-2">
                            <h2 className="text-xl font-semibold text-gray-900">Personal de Apoyo</h2>
                            <button type="button" onClick={() => setIsAddMemberModalOpen(true)} className="text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-purple-200">
                                + Agregar
                            </button>
                        </div>
                        {teamMembers.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {teamMembers.map(member => (
                                    <div key={member.id} className="border p-4 rounded-lg bg-gray-50 relative">
                                        <button type="button" onClick={() => handleRemoveMember(member.id!)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold">&times;</button>
                                        <p className="font-bold">{member.nombre} {member.apellido}</p>
                                        <p className="text-xs text-gray-500">{member.email} • {member.telefono}</p>
                                        <p className="mt-1 text-xs inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{member.rol}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 border rounded-lg p-4 text-center bg-gray-50">No hay personal asociado.</p>
                        )}
                    </section>

                    {/* Aseguradoras (ARS) */}
                    <section className="bg-white px-6 py-8 border border-gray-200 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-6 border-b pb-2">
                            <h2 className="text-xl font-semibold text-gray-900">Aseguradoras (ARS)</h2>
                            <button type="button" onClick={() => setIsAddArsModalOpen(true)} className="text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-purple-200">
                                + Agregar ARS
                            </button>
                        </div>
                        {arsProviders.length > 0 ? (
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-2 text-gray-500 font-semibold">ARS</th>
                                            <th className="px-4 py-2 text-gray-500 font-semibold">Código</th>
                                            <th className="px-4 py-2 text-gray-500 font-semibold w-16">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {arsProviders.map(ars => (
                                            <tr key={ars.arsCode}>
                                                <td className="px-4 py-3 font-medium">{ars.arsName}</td>
                                                <td className="px-4 py-3 font-mono text-gray-600">{ars.providerCode}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button type="button" onClick={() => handleRemoveArs(ars.arsCode)} className="text-red-500 font-bold hover:underline">X</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 border rounded-lg p-4 text-center bg-gray-50">No se han asociado ARS.</p>
                        )}
                    </section>

                    {/* Acciones Finales */}
                    <div className="flex justify-end pt-4 gap-4 pb-12">
                        <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={submitting} className="flex items-center gap-2 px-8 py-3 bg-purple-600 text-white font-bold rounded-md hover:bg-purple-700 disabled:opacity-50">
                            {submitting ? 'Guardando Cambios...' : <><Save className="w-5 h-5" /> Enviar Ajustes</>}
                        </button>
                    </div>
                </form>
            </div>

            <CameraModal
                isOpen={isCameraOpen}
                onClose={() => setIsCameraOpen(false)}
                onCapture={(base64String) => {
                    setBiometricImageBase64(base64String);
                }}
            />
            <AddTeamMemberModal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                onAdd={(member) => handleAddTeamMember(member)}
            />
            <AddArsModal
                isOpen={isAddArsModalOpen}
                onClose={() => setIsAddArsModalOpen(false)}
                onSave={handleSaveArs}
            />
        </div>
    );
}
