import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RegistrationStepper from '../components/RegistrationStepper.js';
import AddArsModal from '../components/AddArsModal.js';
import { ProviderArsRelation } from '../../domain/types';

const STORAGE_KEY_ARS = 'koneksi_ars_providers';

export default function DoctorStep3() {
    const [isAddArsModalOpen, setIsAddArsModalOpen] = useState(false);
    const [arsRecords, setArsRecords] = useState<ProviderArsRelation[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY_ARS);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Error parsing ARS from local storage", e);
            }
        }
        return [];
    });

    useEffect(() => {
        if (arsRecords.length > 0) {
            localStorage.setItem(STORAGE_KEY_ARS, JSON.stringify(arsRecords));
        } else {
            localStorage.removeItem(STORAGE_KEY_ARS);
        }
    }, [arsRecords]);

    const handleSaveArs = (arsRelation: ProviderArsRelation) => {
        // Prevent duplicates based on arsCode
        if (!arsRecords.find(r => r.arsCode === arsRelation.arsCode)) {
            setArsRecords([...arsRecords, arsRelation]);
        }
    };

    const handleRemoveArs = (arsCode: string) => {
        setArsRecords(arsRecords.filter(r => r.arsCode !== arsCode));
    };
    return (
        <div className="flex flex-col min-h-screen bg-background-light text-slate-900">
            <RegistrationStepper currentStep={3} />

            <main className="flex-grow px-4 md:px-20 lg:px-40 py-10">
                <div className="max-w-4xl mx-auto">
                    {/* Main Title Section */}
                    <section className="mb-6">
                        <h2 className="text-3xl md:text-4xl font-black mb-3 leading-tight tracking-tight text-slate-900">
                            Relación con Administradoras de Salud (ARS)
                        </h2>
                        <p className="text-slate-600 text-lg">
                            Ingrese los datos de prestador de salud para cada ARS con la que tenga contrato vigente.
                        </p>
                    </section>

                    {/* Optional Step Banner */}
                    <div className="mb-8 p-5 bg-accent-purple rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-accent-purple/20">
                        <div className="flex gap-4">
                            <span className="material-symbols-outlined text-white shrink-0 mt-0.5">info</span>
                            <div>
                                <p className="text-white font-bold text-base mb-1">Paso Opcional</p>
                                <p className="text-purple-100 text-sm leading-relaxed">
                                    Puede continuar al siguiente paso y agregar la relación con las ARS con las que tiene contrato luego desde la configuración de la plataforma.
                                </p>
                            </div>
                        </div>
                        <button className="whitespace-nowrap flex items-center gap-2 text-white font-bold text-sm hover:underline">
                            Entendido
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>

                    {/* ARS Section Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-900">Administradoras Participantes</h3>
                        <button
                            onClick={() => setIsAddArsModalOpen(true)}
                            className="bg-accent-purple hover:bg-accent-purple/90 text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors">
                            <span className="material-symbols-outlined text-lg">add</span>
                            Agregar ARS
                        </button>
                    </div>

                    {/* ARS List */}
                    <div className="space-y-4 mb-8">
                        {arsRecords.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                                <p className="text-slate-500">No ha asociado ninguna ARS todavía.</p>
                            </div>
                        ) : (
                            arsRecords.map((ars) => {
                                // Some dynamic logic for visual variety or pending statuses based on existing mockups 
                                // (For now, all local additions are shown as PENDING / EN PROCESO as real verifications would be server-side)
                                return (
                                    <div key={ars.arsCode} className="bg-white border border-slate-200 p-5 rounded-xl flex flex-wrap md:flex-nowrap items-center gap-6 shadow-sm hover:shadow-md transition-all">
                                        <div className="w-14 h-14 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 border border-slate-100 uppercase font-bold text-slate-400 text-xl">
                                            {ars.arsName.substring(0, 2)}
                                        </div>
                                        <div className="flex-1 min-w-[200px]">
                                            <h4 className="font-bold text-lg text-slate-900">{ars.arsName}</h4>
                                            <p className="text-sm text-slate-500 mb-1">Código de prestador: <span className="font-mono font-medium text-slate-700">{ars.providerCode}</span></p>
                                        </div>
                                        <div className="flex items-center gap-4 ml-auto">
                                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[11px] font-bold tracking-wider rounded-full flex items-center gap-1 border border-amber-200">
                                                <span className="material-symbols-outlined text-[14px]">pending</span>
                                                PENDIENTE
                                            </span>
                                            <button
                                                onClick={() => handleRemoveArs(ars.arsCode)}
                                                className="text-slate-400 hover:text-red-500 transition-colors p-2"
                                                title="Eliminar asociación"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Help Section */}
                    <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl mb-12">
                        <div className="flex gap-4">
                            <span className="material-symbols-outlined text-primary">help_outline</span>
                            <div>
                                <h5 className="font-bold text-slate-900 mb-2">¿No conoces tu código de prestador?</h5>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Por lo general, puedes consultar directamente a cada ARS a través de su portal de prestadores o revisando los contratos físicos vigentes con la institución. Este código es indispensable para la facturación electrónica.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-auto pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                        <Link to="/register/doctor-step-2" className="flex items-center gap-2 text-slate-600 font-bold text-sm hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Volver
                        </Link>
                        <div className="flex items-center gap-8 w-full md:w-auto">
                            <Link to="/register/doctor-step-4" className="text-slate-500 text-sm font-bold hover:underline">Omitir</Link>
                            <Link to="/register/doctor-step-4" className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-lg shadow-primary/20 w-full md:w-auto">
                                Guardar y Continuar
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <AddArsModal
                isOpen={isAddArsModalOpen}
                onClose={() => setIsAddArsModalOpen(false)}
                onSave={handleSaveArs}
            />
        </div>
    );
}
