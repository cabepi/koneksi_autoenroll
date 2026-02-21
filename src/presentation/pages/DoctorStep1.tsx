import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import RegistrationStepper from '../components/RegistrationStepper.js';
import { MedicalSpecialty } from '../../domain/types.js';
import OtpModal from '../components/OtpModal.js';
import CameraModal from '../components/CameraModal.js';

export default function DoctorStep1() {
    const [cedula, setCedula] = useState("");
    const [nombreCompleto, setNombreCompleto] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [exequatur, setExequatur] = useState("");
    const [fechaRegistro, setFechaRegistro] = useState("");
    const [fechaRegistroType, setFechaRegistroType] = useState<"text" | "date">("text");

    const [searchQuery, setSearchQuery] = useState("");
    const [options, setOptions] = useState<MedicalSpecialty[]>([]);
    const [selectedSpecialties, setSelectedSpecialties] = useState<MedicalSpecialty[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Email validation states
    const [email, setEmail] = useState("");
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpId, setOtpId] = useState<string | null>(null);
    const [isGeneratingOtp, setIsGeneratingOtp] = useState(false);

    // Biometric state
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [biometricImageUrl, setBiometricImageUrl] = useState<string | null>(null);

    // Simple regex for email structure
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Phone state
    const [telefono, setTelefono] = useState("");

    const formatTelefono = (value: string) => {
        const numbers = value.replace(/\D/g, '').slice(0, 10);
        if (numbers.length === 0) return '';
        if (numbers.length <= 3) return `(${numbers}`;
        if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
        return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    };

    const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTelefono(formatTelefono(e.target.value));
    };

    // --- State Persistence & Validation Logic ---
    const STORAGE_KEY = 'koneksi_registration_step2';

    // Hydrate state from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.cedula) setCedula(parsed.cedula);
                if (parsed.nombreCompleto) setNombreCompleto(parsed.nombreCompleto);
                if (parsed.exequatur) setExequatur(parsed.exequatur);
                if (parsed.fechaRegistro) {
                    setFechaRegistro(parsed.fechaRegistro);
                    setFechaRegistroType("date");
                }

                // BUG FIX: Hydrating the specialties array from local storage
                if (parsed.selectedSpecialties && Array.isArray(parsed.selectedSpecialties)) {
                    setSelectedSpecialties(parsed.selectedSpecialties);
                }

                if (parsed.email) setEmail(parsed.email);
                if (parsed.isEmailVerified) setIsEmailVerified(parsed.isEmailVerified);
                if (parsed.telefono) setTelefono(parsed.telefono);
                if (parsed.biometricImageUrl) setBiometricImageUrl(parsed.biometricImageUrl);
            } catch (err) {
                console.error("Error parsing saved registration data", err);
            }
        }
    }, []);

    // Save state to localStorage whenever a key field changes
    useEffect(() => {
        // We avoid saving immediately on mount if fields are empty by checking if there's any data to save,
        // but to be safe we just serialize the current state.
        const stateToSave = {
            cedula,
            nombreCompleto,
            exequatur,
            fechaRegistro,
            selectedSpecialties,
            email,
            isEmailVerified,
            telefono,
            biometricImageUrl
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, [cedula, nombreCompleto, exequatur, fechaRegistro, selectedSpecialties, email, isEmailVerified, telefono, biometricImageUrl]);

    // Validation Check for the "Continuar" button
    const missingFields: string[] = [];
    if (cedula.length !== 13) missingFields.push("Cédula Válida");
    if (nombreCompleto.length === 0) missingFields.push("Acreditación JCE");
    if (exequatur.length === 0) missingFields.push("No. de Exequátur");
    if (fechaRegistro.length === 0) missingFields.push("Fecha de Registro");
    if (selectedSpecialties.length === 0) missingFields.push("Especialidad Médica");
    if (!isEmailVerified) missingFields.push("Verificación de Correo (OTP)");
    if (biometricImageUrl === null) missingFields.push("Captura Biométrica");

    const isFormValid = missingFields.length === 0;

    // --- End State Persistence & Validation Logic ---

    useEffect(() => {
        if (searchQuery.length < 4) {
            setOptions([]);
            setShowOptions(false);
            return;
        }

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

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
        }, 400); // 400ms debounce

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [searchQuery]);

    const handleSelectSpecialty = (sp: MedicalSpecialty) => {
        if (!selectedSpecialties.find(s => s.slug === sp.slug)) {
            setSelectedSpecialties([...selectedSpecialties, sp]);
        }
        setSearchQuery("");
        setOptions([]);
        setShowOptions(false);
    };

    const handleRemoveSpecialty = (slug: string) => {
        setSelectedSpecialties(selectedSpecialties.filter(s => s.slug !== slug));
    };

    const formatCedula = (value: string) => {
        const numbers = value.replace(/\D/g, '').slice(0, 11);
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 10) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 10)}-${numbers.slice(10)}`;
    };

    const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCedula(formatCedula(e.target.value));
        setErrorMsg("");
    };

    const isValidCedula = cedula.length === 13;

    const handleValidar = async () => {
        if (!isValidCedula) return;

        // Reset browser context (localStorage)
        localStorage.removeItem('koneksi_registration_step2');
        localStorage.removeItem('koneksi_team_members');
        localStorage.removeItem('koneksi_selected_centers');
        localStorage.removeItem('koneksi_ars_providers');

        // Reset state variables (except the cedula we are validating)
        setNombreCompleto("");
        setExequatur("");
        setFechaRegistro("");
        setSelectedSpecialties([]);
        setEmail("");
        setIsEmailVerified(false);
        setTelefono("");
        setBiometricImageUrl(null);

        setIsLoading(true);
        setErrorMsg("");

        try {
            const rawCedula = cedula.replace(/-/g, '');
            const response = await fetch('/api/jce', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cedula: rawCedula })
            });

            if (!response.ok) {
                throw new Error('Error al validar la cédula');
            }

            const rawData = await response.json();
            if (response.status === 200 && rawData.data) {
                const { nombres, primerApellido, segundoApellido } = rawData.data;
                // join non-empty values with a space
                const fullName = [nombres, primerApellido, segundoApellido].filter(Boolean).join(' ');
                setNombreCompleto(fullName);
            } else {
                setNombreCompleto("");
                setErrorMsg("No se encontró al ciudadano");
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("Error validando");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOtp = async () => {
        if (!isValidEmail) return;
        setIsGeneratingOtp(true);
        try {
            const response = await fetch('/api/otp/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: email })
            });
            if (response.ok) {
                const data = await response.json();
                setOtpId(data.otpId);
                setShowOtpModal(true);
            } else {
                alert("Error al enviar código. Por favor intente más tarde.");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión al enviar código.");
        } finally {
            setIsGeneratingOtp(false);
        }
    };
    return (
        <div className="flex flex-col min-h-screen bg-background-light text-slate-900">
            <RegistrationStepper currentStep={1} />

            <main className="flex-grow px-4 md:px-20 lg:px-40 py-10 pt-16">
                <div className="max-w-4xl mx-auto">
                    {/* Page Title & Intro */}
                    <div className="mb-8">
                        <h1 className="text-slate-900 text-4xl font-bold mb-3">Datos Profesionales</h1>
                        <p className="text-slate-600 text-lg">
                            Por favor, proporcione su identificación médica y detalles de contacto verificados para continuar con su verificación.
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-xl custom-shadow border border-slate-200 p-6 md:p-8">
                        <div className="flex items-center gap-2 mb-8 border-b border-slate-100 pb-4">
                            <span className="material-symbols-outlined text-primary text-2xl">badge</span>
                            <h2 className="text-xl font-bold text-slate-900">Información Profesional</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Cédula, Nombre Completo & Validar Row */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                                {/* Cédula */}
                                <div className="flex flex-col gap-2 md:col-span-3">
                                    <label className="text-sm font-semibold text-slate-700">Número de Cédula</label>
                                    <div className="relative w-full">
                                        <input
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                            type="text"
                                            value={cedula}
                                            onChange={handleCedulaChange}
                                            placeholder="000-0000000-0"
                                            maxLength={13}
                                        />
                                        {errorMsg && <p className="text-red-500 text-xs mt-1 absolute -bottom-5">{errorMsg}</p>}
                                    </div>
                                </div>

                                {/* Full Name (Read Only) */}
                                <div className="flex flex-col gap-2 md:col-span-7">
                                    <label className="text-sm font-semibold text-slate-700">Nombre Completo</label>
                                    <input className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg py-3 px-4 cursor-not-allowed" disabled readOnly type="text" value={nombreCompleto} placeholder="Nombre desde JCE..." />
                                </div>

                                {/* Validar Button */}
                                <div className="md:col-span-2 flex justify-end">
                                    <button
                                        onClick={handleValidar}
                                        disabled={!isValidCedula || isLoading}
                                        className={`w-full text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 ${(!isValidCedula || isLoading) ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand-purple-dark hover:bg-brand-purple-dark/90'}`}
                                    >
                                        {isLoading ? 'Validando...' : 'Validar'}
                                    </button>
                                </div>
                            </div>

                            {/* Specialties Chips */}
                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-semibold text-slate-700">Especialidades</label>

                                {selectedSpecialties.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {selectedSpecialties.map((sp) => (
                                            <span key={sp.slug} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                                                {sp.fallback_name}
                                                <span
                                                    className="material-symbols-outlined text-xs cursor-pointer hover:text-red-500"
                                                    onClick={() => handleRemoveSpecialty(sp.slug)}
                                                >
                                                    close
                                                </span>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="relative relative-search-container">
                                    <input
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                        type="text"
                                        placeholder="Buscar especialidad (min. 4 letras)..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => { if (options.length > 0) setShowOptions(true); }}
                                    />
                                    {isSearching && (
                                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-400 animate-spin">sync</span>
                                        </div>
                                    )}

                                    {showOptions && options.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {options.map((option) => (
                                                <div
                                                    key={option.slug}
                                                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-slate-700 border-b border-slate-50 last:border-0"
                                                    onClick={() => handleSelectSpecialty(option)}
                                                >
                                                    {option.fallback_name}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Close dropdown implicitly on blur but delay slightly so onClick can register */}
                                    {showOptions && (
                                        <div className="fixed inset-0 z-0" onClick={() => setShowOptions(false)}></div>
                                    )}
                                </div>
                            </div>

                            {/* Two Column Row: License & Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700">Exequátur (Licencia Médica)</label>
                                    <input
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none uppercase"
                                        type="text"
                                        placeholder="Ej. EXE-123456"
                                        value={exequatur}
                                        onChange={(e) => setExequatur(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700">Fecha de Registro</label>
                                    <div className="relative cursor-pointer">
                                        <input
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none z-10 relative bg-transparent"
                                            type={fechaRegistroType}
                                            placeholder="dd-mm-yyyy"
                                            value={fechaRegistro}
                                            onChange={(e) => setFechaRegistro(e.target.value)}
                                            onFocus={() => setFechaRegistroType("date")}
                                            onBlur={() => { if (!fechaRegistro) setFechaRegistroType("text") }}
                                        />
                                        {fechaRegistroType === "text" && (
                                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none z-0">
                                                <span className="material-symbols-outlined text-slate-400">calendar_month</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comunicación Section */}
                    <div className="bg-white rounded-xl custom-shadow border border-slate-200 p-6 md:p-8 mt-6">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-brand-yellow text-2xl">chat_bubble</span>
                            <h2 className="text-xl font-bold text-slate-900">Comunicación</h2>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-8 flex items-start gap-3">
                            <span className="material-symbols-outlined text-purple-600 mt-0.5">verified_user</span>
                            <p className="text-sm text-purple-800 leading-relaxed">
                                La verificación de <span className="font-bold">correo electrónico</span> es obligatoria para continuar. La verificación telefónica es opcional pero <span className="font-bold">recomendada</span>.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 mb-6">
                            <label className="text-sm font-semibold text-slate-700">Correo Electrónico</label>
                            <div className="flex gap-2">
                                <input
                                    className="flex-grow bg-slate-50 border border-slate-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isEmailVerified}
                                />
                                {isEmailVerified ? (
                                    <div className="bg-green-100 text-green-700 font-bold py-3 px-8 rounded-lg flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined">check_circle</span>
                                        Verificado
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleSendOtp}
                                        disabled={!isValidEmail || isGeneratingOtp}
                                        className={`font-bold py-3 px-8 rounded-lg transition-all text-white flex gap-2 items-center justify-center ${(!isValidEmail || isGeneratingOtp) ? 'bg-slate-300 cursor-not-allowed text-slate-500' : 'bg-brand-yellow hover:bg-yellow-400'}`}
                                    >
                                        {isGeneratingOtp && <span className="material-symbols-outlined animate-spin text-sm">sync</span>}
                                        Verificar
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700">Número de Teléfono</label>
                            <div className="flex border border-slate-300 rounded-lg overflow-hidden flex-grow">
                                <div className="bg-slate-50 px-4 py-3 border-r border-slate-300 text-slate-500">+1</div>
                                <input
                                    className="w-full bg-slate-50 border-none py-3 px-4 focus:ring-0 outline-none"
                                    placeholder="(809) 000-0000"
                                    type="tel"
                                    value={telefono}
                                    onChange={handleTelefonoChange}
                                    maxLength={14}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Verificación Biométrica Section */}
                    <div className="bg-white rounded-xl custom-shadow border border-slate-200 p-6 md:p-8 mt-6 mb-10">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-brand-yellow text-2xl">person_pin_circle</span>
                            <h2 className="text-xl font-bold text-slate-900">Verificación Biométrica</h2>
                        </div>

                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center text-center">
                            {biometricImageUrl ? (
                                <>
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-green-500 mb-4 shadow-lg relative">
                                        <img src={biometricImageUrl} alt="Biometría" className="w-full h-full object-cover" />
                                        <div className="absolute top-0 right-0 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                                            <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">Escaneo Completado</h3>
                                    <p className="text-green-600 text-sm font-semibold mb-6">
                                        Rostro verificado exitosamente.
                                    </p>
                                    <button onClick={() => setIsCameraOpen(true)} className="border border-slate-300 hover:bg-slate-50 text-slate-600 font-bold py-2 px-6 rounded-lg transition-all mb-4">
                                        Volver a tomar foto
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-brand-yellow/10 rounded-full flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-brand-yellow text-3xl">photo_camera</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">Reconocimiento Facial Biométrico</h3>
                                    <p className="text-slate-400 text-sm max-w-md mb-8">
                                        Este paso es obligatorio para todos los prestadores médicos. Asegúrate de estar en un área bien iluminada y que tu rostro sea completamente visible.
                                    </p>
                                    <button onClick={() => setIsCameraOpen(true)} className="bg-brand-yellow hover:opacity-90 text-white font-bold py-3 px-10 rounded-lg transition-all shadow-md mb-6">
                                        Iniciar Escaneo Facial
                                    </button>
                                </>
                            )}
                            <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                                <span className="material-symbols-outlined text-sm">verified_user</span>
                                PROCESAMIENTO SEGURO DE DATOS BIOMÉTRICOS
                            </div>
                        </div>
                    </div>

                    {/* Footer Action Buttons */}
                    <div className="flex items-center justify-between mt-10">
                        <Link to="/register" className="flex items-center gap-2 text-brand-purple font-bold hover:underline">
                            <span className="material-symbols-outlined">arrow_back</span>
                            Volver
                        </Link>

                        <div className="flex flex-col items-end">
                            {isFormValid ? (
                                <Link to="/register/doctor-step-2" className="bg-brand-yellow text-white px-10 py-4 rounded-xl font-bold flex items-center gap-4 transition-all hover:bg-opacity-90 shadow-md transform hover:-translate-y-1">
                                    Continuar
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </Link>
                            ) : (
                                <div className="flex flex-col items-end gap-2">
                                    <button disabled className="bg-slate-300 text-slate-500 px-10 py-4 rounded-xl font-bold flex items-center gap-4 cursor-not-allowed">
                                        Continuar
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </button>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-red-500 mb-1">Para continuar, falta completar:</p>
                                        <ul className="text-[11px] text-slate-500">
                                            {missingFields.map((field) => (
                                                <li key={field}>• {field}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <OtpModal
                isOpen={showOtpModal}
                email={email}
                otpId={otpId}
                onClose={() => setShowOtpModal(false)}
                onSuccess={() => setIsEmailVerified(true)}
                expirationMinutes={5}
            />

            <CameraModal
                isOpen={isCameraOpen}
                onClose={() => setIsCameraOpen(false)}
                onCapture={(img) => setBiometricImageUrl(img)}
            />
        </div>
    );
}
