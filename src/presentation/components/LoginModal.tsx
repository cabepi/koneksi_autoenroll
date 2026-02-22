import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [email, setEmail] = useState('');
    const [otpId, setOtpId] = useState<string | null>(null);
    const [otp, setOtp] = useState(['', '', '', '']);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // For OTP step
    const expirationMinutes = 5;
    const [secondsLeft, setSecondsLeft] = useState(expirationMinutes * 60);

    const inputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

    // Reset state when opened
    useEffect(() => {
        if (isOpen) {
            setStep('email');
            setEmail('');
            setOtp(['', '', '', '']);
            setErrorMsg("");
            setOtpId(null);
            setIsLoading(false);
        }
    }, [isOpen]);

    // Timer logic for OTP
    useEffect(() => {
        if (!isOpen || step !== 'otp' || secondsLeft <= 0) return;
        const intervalId = setInterval(() => {
            setSecondsLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [isOpen, step, secondsLeft]);

    if (!isOpen) return null;

    const formattedTime = `${Math.floor(secondsLeft / 60)}:${(secondsLeft % 60).toString().padStart(2, '0')}`;
    const canResend = secondsLeft <= 0;

    // --- STEP 1: EMAIL ---
    const handleGenerateOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
            setErrorMsg("Ingresa un correo electrónico válido");
            return;
        }

        setIsLoading(true);
        setErrorMsg("");

        try {
            const response = await fetch('/api/auth/generate-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'No autorizado');
            }

            setOtpId(data.otpId);
            setStep('otp');
            setSecondsLeft(expirationMinutes * 60);
        } catch (error: any) {
            setErrorMsg(error.message || "Error de conexión");
        } finally {
            setIsLoading(false);
        }
    };

    // --- STEP 2: OTP ---
    const handleChange = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setErrorMsg("");

        if (value && index < 3) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').trim();
        if (/^\d{4}$/.test(pastedData)) {
            const digits = pastedData.split('');
            setOtp(digits);
            inputRefs[3].current?.focus();
        }
    };

    const handleValidate = async () => {
        const fullCode = otp.join('');
        if (fullCode.length !== 4) {
            setErrorMsg("Debes ingresar 4 dígitos");
            return;
        }

        setIsLoading(true);
        setErrorMsg("");

        try {
            const response = await fetch('/api/auth/validate-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), otpId, code: fullCode })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Código inválido o expirado');
            }

            // Success
            login(result.token, result.user);
            setTimeout(() => {
                onClose();
                navigate('/backoffice/dashboard');
            }, 1000);
        } catch (error: any) {
            setErrorMsg(error.message || "Error al validar el código");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        setIsLoading(true);
        setErrorMsg("");

        try {
            const response = await fetch('/api/auth/generate-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() })
            });

            if (!response.ok) throw new Error("No pudimos reenviar el código");

            const data = await response.json();

            setOtpId(data.otpId);
            setSecondsLeft(expirationMinutes * 60);
            setOtp(['', '', '', '']);
            inputRefs[0].current?.focus();
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const isComplete = otp.every(digit => digit !== '');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-brand-purple-dark text-white p-6 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-4xl">
                                {step === 'email' ? 'lock' : 'mark_email_read'}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold">
                            {step === 'email' ? 'Gestión Interna' : 'Verifica tu Correo'}
                        </h2>
                        {step === 'otp' && (
                            <p className="text-purple-100 text-sm mt-2 text-center">
                                Ingresa el código de 4 dígitos enviado a:<br />
                                <span className="font-bold">{email}</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="p-8">
                    {errorMsg && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center gap-2 border border-red-100">
                            <span className="material-symbols-outlined text-[20px]">error</span>
                            {errorMsg}
                        </div>
                    )}

                    {step === 'email' ? (
                        <form onSubmit={handleGenerateOtp} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="usuario@unipago.com.do"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all outline-none"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !email}
                                className="w-full py-4 rounded-xl font-bold flex justify-center text-lg transition-all shadow-md bg-brand-yellow hover:bg-yellow-400 text-white disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {isLoading ? 'Cargando...' : 'Obtener Código'}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-center gap-3 mb-8">
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={inputRefs[i]}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                        onPaste={i === 0 ? handlePaste : undefined}
                                        className="w-14 h-16 text-center text-2xl font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-purple-dark focus:border-transparent transition-all outline-none"
                                        disabled={isLoading}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleValidate}
                                disabled={!isComplete || isLoading}
                                className={`w-full py-4 rounded-xl font-bold flex justify-center text-lg transition-all shadow-md ${(!isComplete || isLoading) ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-brand-yellow hover:bg-yellow-400 text-white cursor-pointer'}`}
                            >
                                {isLoading ? 'Validando...' : 'Iniciar Sesión'}
                            </button>

                            <div className="mt-6 text-center text-sm text-slate-600">
                                {canResend ? (
                                    <button
                                        onClick={handleResend}
                                        disabled={isLoading}
                                        className="text-brand-purple-dark font-bold hover:underline cursor-pointer"
                                    >
                                        Reenviar código
                                    </button>
                                ) : (
                                    <p>
                                        Podrás reenviar el código en <span className="font-bold text-slate-900">{formattedTime}</span>
                                    </p>
                                )}
                            </div>

                            <div className="mt-4 text-center">
                                <button
                                    onClick={() => setStep('email')}
                                    disabled={isLoading}
                                    className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer"
                                >
                                    Volver e ingresar otro correo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
