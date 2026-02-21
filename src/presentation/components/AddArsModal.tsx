import { useState, useEffect } from 'react';
import { HealthInsurance, ProviderArsRelation } from '../../domain/types';

interface AddArsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (arsRelation: ProviderArsRelation) => void;
}

export default function AddArsModal({ isOpen, onClose, onSave }: AddArsModalProps) {
    const [insurances, setInsurances] = useState<HealthInsurance[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedCode, setSelectedCode] = useState('');
    const [providerCode, setProviderCode] = useState('');
    const [pin, setPin] = useState('');
    const [confirmed, setConfirmed] = useState(false);

    useEffect(() => {
        if (isOpen && insurances.length === 0) {
            fetchInsurances();
        }
    }, [isOpen]);

    const fetchInsurances = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/health-insurances');
            if (res.ok) {
                const data = await res.json();
                setInsurances(data);
            }
        } catch (err) {
            console.error('Error fetching health insurances:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        if (!selectedCode || !providerCode || !pin || !confirmed) return;

        const selectedArs = insurances.find(ars => ars.code === selectedCode);
        if (selectedArs) {
            onSave({
                arsCode: selectedArs.code,
                arsName: selectedArs.name,
                providerCode,
                pin
            });
            // Reset state
            setSelectedCode('');
            setProviderCode('');
            setPin('');
            setConfirmed(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    const isFormValid = selectedCode !== '' && providerCode !== '' && pin !== '' && confirmed;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[1.5rem] w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 md:p-8 flex-grow overflow-y-auto">
                    <div className="flex items-start justify-between mb-2">
                        <h2 className="text-2xl font-bold text-slate-900">Agregar Administradora de Salud (ARS)</h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center -mr-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>
                    <p className="text-slate-500 mb-8 text-sm">
                        Proporcione los datos de la ARS que desea asociar para ser utilizada dentro de la Plataforma.
                    </p>

                    <div className="space-y-6">
                        {/* Selector ARS */}
                        <div className="relative">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Administradora de Riesgos de Salud (ARS)</label>
                            <div className="relative">
                                <select
                                    className={`w-full appearance-none px-5 py-3.5 pl-11 bg-white border ${selectedCode ? 'border-brand-yellow/50 ring-2 ring-brand-yellow/10' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all font-medium text-slate-900`}
                                    value={selectedCode}
                                    onChange={(e) => setSelectedCode(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="" disabled className="text-slate-400">seleccione una ars...</option>
                                    {insurances.map((ars) => (
                                        <option key={ars.code} value={ars.code}>{ars.name}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">search</span>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                            </div>
                        </div>

                        {/* Codigo y PIN */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Código de Préstador</label>
                                <input
                                    type="text"
                                    placeholder="p. ej. 00345"
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                                    value={providerCode}
                                    onChange={(e) => setProviderCode(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">PIN</label>
                                <input
                                    type="text"
                                    placeholder="p. ej. 1010"
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Confirmation check */}
                        <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl flex items-start gap-3 mt-8">
                            <input
                                type="checkbox"
                                id="ars-confirm-check"
                                checked={confirmed}
                                onChange={(e) => setConfirmed(e.target.checked)}
                                className="mt-1 w-5 h-5 rounded border-slate-300 text-brand-yellow focus:ring-brand-yellow focus:ring-offset-slate-50 bg-white"
                            />
                            <label htmlFor="ars-confirm-check" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                                Confirmo que el código de prestador ingresado es preciso y está registrado bajo mis credenciales profesionales. Entiendo que esto puede pasar por un proceso de verificación.
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 md:p-8 border-t border-slate-100 flex justify-end gap-4 overflow-hidden">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!isFormValid}
                        className={`px-8 py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${isFormValid ? 'bg-brand-yellow text-white hover:bg-opacity-90 shadow-md shadow-brand-yellow/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                        <span className="material-symbols-outlined text-sm">check</span>
                        Asociar ARS
                    </button>
                </div>
            </div>
        </div>
    );
}
