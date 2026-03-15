import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { CheckCircle2, Clock, XCircle, FileText, ChevronLeft, MapPin, Building2, User, Stethoscope, Mail, Phone, Home, ArrowLeft, AlertTriangle, Fingerprint, Calendar, FileBadge, Download } from 'lucide-react';
import BackofficeHeader from '../../components/backoffice/BackofficeHeader.js';

export default function BackofficeEnrollmentStatus() {
    const { id } = useParams<{ id: string }>();
    const { token, logout } = useAuth();
    const [requestData, setRequestData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [biometricBlobUrl, setBiometricBlobUrl] = useState<string | null>(null);
    const [isLoadingBiometric, setIsLoadingBiometric] = useState(false);

    const [reasonsList, setReasonsList] = useState<any[]>([]);
    const [selectedAction, setSelectedAction] = useState<'APPROVE' | 'OBSERVE' | 'REJECT' | null>(null);
    const [selectedReasonId, setSelectedReasonId] = useState<string>('');
    const [evaluationNotes, setEvaluationNotes] = useState<string>('');
    const [isSubmittingEval, setIsSubmittingEval] = useState(false);
    const [evalError, setEvalError] = useState('');

    const fetchStatus = async () => {
        setIsLoading(true);
        setErrorMsg("");
        try {
            const res = await fetch(`/api/backoffice/requests/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    logout();
                    return;
                }
                if (res.status === 404) {
                    throw new Error("Solicitud no encontrada.");
                }
                throw new Error("Error al consultar el estado.");
            }
            const data = await res.json();
            setRequestData(data);
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchReasons = async (actionType: 'OBSERVE' | 'REJECT') => {
        try {
            const res = await fetch(`/api/backoffice/evaluation-reasons?type=${actionType}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setReasonsList(data);
            }
        } catch (err) {
            console.error("Failed to load evaluation reasons", err);
        }
    };

    const handleActionSelect = (action: 'APPROVE' | 'OBSERVE' | 'REJECT') => {
        setSelectedAction(action);
        setSelectedReasonId('');
        setEvaluationNotes('');
        setEvalError('');
        if (action === 'OBSERVE' || action === 'REJECT') {
            fetchReasons(action);
        }
    };

    const submitEvaluation = async () => {
        if (!selectedAction) return;
        
        if (selectedAction !== 'APPROVE') {
            if (!selectedReasonId) {
                setEvalError('Debes seleccionar un motivo catalogado.');
                return;
            }
            const selectedReasonObj = reasonsList.find(r => r.id.toString() === selectedReasonId);
            if (selectedReasonObj?.description.toLowerCase() === 'otro' && !evaluationNotes.trim()) {
                setEvalError('Por favor especifica los detalles en las notas si elegiste "Otro".');
                return;
            }
        }

        setIsSubmittingEval(true);
        setEvalError('');

        try {
            const payload = {
                action: selectedAction,
                reason_id: selectedReasonId ? parseInt(selectedReasonId) : undefined,
                notes: evaluationNotes
            };

            const res = await fetch(`/api/backoffice/requests/${id}/evaluate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Ocurrió un error al procesar la evaluación.');
            }

            // Reload status on success
            await fetchStatus();
            setSelectedAction(null);
            
        } catch (err: any) {
            setEvalError(err.message);
        } finally {
            setIsSubmittingEval(false);
        }
    };

    const fetchBiometricImage = async (url: string) => {
        setIsLoadingBiometric(true);
        try {
            const res = await fetch(`/api/backoffice/media?url=${encodeURIComponent(url)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Error fetching image");
            
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            setBiometricBlobUrl(objectUrl);
        } catch (err) {
            console.error("Failed to load biometric image securely", err);
        } finally {
            setIsLoadingBiometric(false);
        }
    };

    useEffect(() => {
        if (id && token) {
            fetchStatus();
        }
    }, [id, token]);

    // Clean up blob URL on unmount or when requestData changes
    useEffect(() => {
        if (requestData?.biometric_image_url) {
            fetchBiometricImage(requestData.biometric_image_url);
        }
        return () => {
            if (biometricBlobUrl) {
                URL.revokeObjectURL(biometricBlobUrl);
            }
        };
    }, [requestData?.biometric_image_url]);

    const handleDownloadBiometric = () => {
        if (!biometricBlobUrl || !requestData) return;
        const link = document.createElement('a');
        link.href = biometricBlobUrl;
        link.download = `biometric-${requestData.identification_number}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusConfig = (status?: string) => {
        if (!status) {
            return {
                title: 'Estado Desconocido',
                color: 'bg-gray-100 text-gray-800',
                icon: <AlertTriangle className="w-12 h-12 text-gray-400 mb-4 mx-auto" />,
                description: 'La solicitud fue recibida, pero aún no se le ha asignado un estado visible.'
            };
        }

        switch (status) {
            case 'PENDING_CONFIRMATION':
                return {
                    title: 'Pendiente de Revisión',
                    color: 'bg-yellow-100 text-yellow-800',
                    icon: <Clock className="w-12 h-12 text-yellow-500 mb-4 mx-auto" />,
                    description: 'Tu solicitud ha sido recibida y está en cola para ser revisada por nuestro equipo de credenciales. Te notificaremos cualquier actualización.'
                };
            case 'CORRECTED':
                return {
                    title: 'Ajustes Recibidos',
                    color: 'bg-indigo-100 text-indigo-800',
                    icon: <FileText className="w-12 h-12 text-indigo-500 mb-4 mx-auto" />,
                    description: 'El médico ha enviado ajustes a su solicitud observada y está lista para ser evaluada nuevamente.'
                };
            case 'APPROVED':
                return {
                    title: 'Solicitud Aprobada',
                    color: 'bg-green-100 text-green-800',
                    icon: <CheckCircle2 className="w-12 h-12 text-green-500 mb-4 mx-auto" />,
                    description: '¡Felicidades! Tu solicitud ha sido aprobada exitosamente. Pronto recibirás las instrucciones de acceso a la plataforma.'
                };
            case 'REJECTED':
                return {
                    title: 'Solicitud Rechazada',
                    color: 'bg-red-100 text-red-800',
                    icon: <XCircle className="w-12 h-12 text-red-500 mb-4 mx-auto" />,
                    description: 'Lamentablemente tu solicitud no cumple con los requisitos actuales. Hemos enviado un correo con los detalles del motivo.'
                };
            default:
                return {
                    title: 'Estado Desconocido',
                    color: 'bg-gray-100 text-gray-800',
                    icon: <AlertTriangle className="w-12 h-12 text-gray-400 mb-4 mx-auto" />,
                    description: 'Verificando el estado actual de la solicitud...'
                };
        }
    };

    console.log("EnrollmentStatus rendering state: ", { isLoading, errorMsg, requestData });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className="mt-4 text-gray-600">Consultando estado de la solicitud...</p>
            </div>
        );
    }

    if (errorMsg || !requestData) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
                <div className="w-full max-w-md text-center bg-white rounded-lg shadow-sm border p-8">
                    <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Solicitud No Encontrada</h2>
                    <p className="text-gray-600 mb-6">{errorMsg || 'No pudimos cargar los detalles solicitados.'}</p>
                    <Link to="/" className="text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Volver al Inicio
                    </Link>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(requestData.current_status);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <BackofficeHeader />
            <div className="flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-5xl space-y-6">
                    <div className="bg-white/90 backdrop-blur rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100/50">
                        {/* Header Controls */}
                        <div className="flex justify-between items-center mb-10">
                            <Link
                                to="/backoffice/dashboard"
                                className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-purple-dark text-sm font-medium transition-colors bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Volver al Dashboard
                            </Link>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 md:gap-12 relative items-center">

                            {/* Left Column: Status Information */}
                            <div className="space-y-8 flex flex-col justify-center">
                                <div>
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-purple-light/10 text-brand-purple-light uppercase tracking-wider mb-4 border border-brand-purple-light/20 shadow-sm">
                                        Estado de Solicitud
                                    </span>
                                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight leading-tight">
                                        {statusConfig.title}
                                    </h2>
                                    <p className="text-slate-500 mt-4 text-sm md:text-base leading-relaxed">
                                        {statusConfig.description}
                                    </p>
                                    <p className="text-slate-400 mt-2 text-xs">
                                        Solicitud ingresada el: {new Date(requestData.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Right Column: Key Details Summary */}
                            <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-100">
                                <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-brand-purple-dark" />
                                    Resumen de la Solicitud
                                </h3>
                                <div className="space-y-5">
                                    <div className="flex gap-4 items-start">
                                        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 shrink-0 mt-0.5">
                                            <User className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-0.5 font-medium">Nombre Completo</p>
                                            <p className="text-sm font-semibold text-slate-800">{requestData.full_name}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 items-start">
                                        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 shrink-0 mt-0.5">
                                            <FileText className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-0.5 font-medium">Identificación (Cédula)</p>
                                            <p className="text-sm font-semibold text-slate-800">{requestData.identification_number}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 items-start">
                                        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 shrink-0 mt-0.5">
                                            <FileBadge className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-0.5 font-medium">Exequátur / Licencia Médica</p>
                                            <p className="text-sm font-semibold text-slate-800">{requestData.medical_license || 'No provisto'}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 items-start">
                                        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 shrink-0 mt-0.5">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-0.5 font-medium">Fecha de Graduación/Registro</p>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {requestData.registration_date ? new Date(requestData.registration_date).toLocaleDateString() : 'No provista'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 items-start">
                                        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 shrink-0 mt-0.5">
                                            <Stethoscope className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div className="w-full">
                                            <p className="text-xs text-slate-500 mb-1 font-medium">Especialidad(es)</p>
                                            <div className="flex flex-wrap gap-2">
                                                {/* Specialties mapping handled here to prevent crashes if it's an array of strings or objects */}
                                                {requestData.specialties && Array.isArray(requestData.specialties) ? requestData.specialties.map((spec: any, idx: number) => {
                                                    const label = typeof spec === 'string' ? spec : (spec.name || spec.fallback_name || JSON.stringify(spec));
                                                    return (
                                                        <span key={idx} className="bg-slate-200/50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md text-xs font-medium">
                                                            {label}
                                                        </span>
                                                    );
                                                }) : <span className="text-sm text-slate-500">No especificada</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Accordion / Detailed Sections - Rendered conditionally if requestData exist */}

                    {/* Contact Information */}
                    <div className="bg-white/90 backdrop-blur rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100/50 mt-6">
                        <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2 text-lg">
                            <MapPin className="w-5 h-5 text-brand-purple-dark" />
                            Información de Contacto
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex gap-4 items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Correo Electrónico</p>
                                    <p className="text-sm font-semibold text-slate-800">{requestData.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Teléfono Primario</p>
                                    <p className="text-sm font-semibold text-slate-800">{requestData.phone || 'No provisto'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Biometric Validation */}
                    <div className="bg-white/90 backdrop-blur rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100/50 mt-6">
                        <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2 text-lg">
                            <Fingerprint className="w-5 h-5 text-brand-purple-dark" />
                            Validación Biométrica (Identidad)
                        </h3>
                        {requestData.biometric_image_url ? (
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="rounded-xl overflow-hidden border-4 border-white shadow-md w-full max-w-[240px] bg-slate-100 shrink-0 relative min-h-[320px] flex items-center justify-center">
                                    {isLoadingBiometric ? (
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-brand-purple-dark animate-spin p-2"></div>
                                            <span className="text-xs font-medium">Desencriptando...</span>
                                        </div>
                                    ) : biometricBlobUrl ? (
                                        <img 
                                            src={biometricBlobUrl} 
                                            alt="Selfie Biométrica del Médico" 
                                            className="w-full h-auto object-cover aspect-[3/4]"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-red-400 px-4 text-center">
                                            <AlertTriangle className="w-8 h-8 mb-2" />
                                            <span className="text-xs font-medium">Error al cargar la imagen segura</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4 max-w-lg pt-2">
                                    <p className="text-slate-600 text-sm">
                                        Esta es la imagen de captura facial proporcionada durante el proceso de enrolamiento 
                                        para validar la identidad asociada al documento de identidad ({requestData.identification_number}).
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-100 text-sm font-medium">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Imagen Recibida
                                        </div>
                                        <button 
                                            onClick={handleDownloadBiometric}
                                            disabled={!biometricBlobUrl || isLoadingBiometric}
                                            className="inline-flex items-center gap-2 bg-white text-slate-700 hover:text-brand-purple-dark px-4 py-2 rounded-lg border border-slate-200 hover:border-brand-purple-light hover:bg-slate-50 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                        >
                                            <Download className="w-4 h-4" />
                                            Descargar Imagen
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm">Validación biométrica ausente</p>
                                    <p className="text-sm mt-1 text-yellow-700/80">Esta solicitud fue procesada sin enviar una fotografía biométrica válida o la carga falló.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Medical Centers */}
                    {requestData.medical_centers && Array.isArray(requestData.medical_centers) && requestData.medical_centers.length > 0 && (
                        <div className="bg-white/90 backdrop-blur rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100/50 mt-6">
                            <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2 text-lg">
                                <Building2 className="w-5 h-5 text-brand-purple-dark" />
                                Centros Médicos Inscritos
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {requestData.medical_centers.map((center: any, i: number) => {
                                    const centerName = typeof center === 'string' ? center : center.name || 'Centro sin nombre';
                                    return (
                                        <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow hover:border-brand-purple-light/50 group">
                                            <div className="bg-slate-50 p-2 rounded-lg group-hover:bg-brand-purple-light/10 transition-colors">
                                                <Home className="w-4 h-4 text-slate-400 group-hover:text-brand-purple-dark transition-colors" />
                                            </div>
                                            <div className="mt-1">
                                                <p className="text-sm font-medium text-slate-800 leading-tight">{centerName}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Team Members */}
                    {requestData.team_members && Array.isArray(requestData.team_members) && requestData.team_members.length > 0 && (
                        <div className="bg-white/90 backdrop-blur rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100/50 mt-6">
                            <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2 text-lg">
                                <User className="w-5 h-5 text-brand-purple-dark" />
                                Personal de Apoyo (Secretarias/Asistentes)
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {requestData.team_members.map((member: any, i: number) => {
                                    const isString = typeof member === 'string';
                                    const name = isString ? member : (member.nombre ? `${member.nombre} ${member.apellido}` : member.fullName || member.name || 'Asistente');
                                    const doc = isString ? undefined : member.cedula || member.documentId;
                                    const role = isString ? undefined : member.rol;
                                    return (
                                        <div key={i} className="p-4 bg-slate-50/70 rounded-xl flex items-center gap-3">
                                            <div className="bg-white p-2 rounded-full border border-slate-100 shadow-sm">
                                                <User className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <p className="text-sm font-semibold text-slate-800 leading-tight">{name}</p>
                                                {role && <p className="text-sm text-slate-600 font-medium">{role}</p>}
                                                {doc && <p className="text-xs text-slate-500 mt-1">Cédula: {doc}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {requestData.ars_providers && requestData.ars_providers.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 mt-6">
                            <h3 className="font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">
                                ARS Afiliadas
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {requestData.ars_providers.map((ars: any, idx: number) => (
                                    <span key={idx} className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-slate-50 text-slate-700 border border-slate-200">
                                        {ars.arsName} (Código: {ars.providerCode})
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Evaluation Action Block */}
                    {(requestData.current_status === 'PENDING_CONFIRMATION' || requestData.current_status === 'CORRECTED') && (
                        <div className="bg-white/90 backdrop-blur rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100/50 mt-6 md:mt-10 mb-10">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                                Decisión Final de Evaluación
                            </h3>
                            
                            {!selectedAction ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <button 
                                        onClick={() => handleActionSelect('APPROVE')}
                                        className="py-4 px-6 bg-green-50 hover:bg-green-100 text-green-700 font-semibold rounded-xl border border-green-200 transition-colors flex flex-col items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="w-6 h-6" />
                                        Aprobar Alta
                                    </button>
                                    <button 
                                        onClick={() => handleActionSelect('OBSERVE')}
                                        className="py-4 px-6 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-semibold rounded-xl border border-yellow-200 transition-colors flex flex-col items-center justify-center gap-2"
                                    >
                                        <AlertTriangle className="w-6 h-6" />
                                        Observar Solicitud
                                    </button>
                                    <button 
                                        onClick={() => handleActionSelect('REJECT')}
                                        className="py-4 px-6 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl border border-red-200 transition-colors flex flex-col items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-6 h-6" />
                                        Rechazar
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                                    {/* Selected Action Header */}
                                    <div className={`p-4 rounded-xl flex items-center justify-between border ${
                                        selectedAction === 'APPROVE' ? 'bg-green-50 border-green-200 text-green-700' :
                                        selectedAction === 'OBSERVE' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                        'bg-red-50 border-red-200 text-red-700'
                                    }`}>
                                        <div className="flex items-center gap-3 font-semibold">
                                            {selectedAction === 'APPROVE' && <CheckCircle2 className="w-5 h-5" />}
                                            {selectedAction === 'OBSERVE' && <AlertTriangle className="w-5 h-5" />}
                                            {selectedAction === 'REJECT' && <XCircle className="w-5 h-5" />}
                                            <span>
                                                {selectedAction === 'APPROVE' ? 'Estás a punto de Aprobar esta solicitud' :
                                                 selectedAction === 'OBSERVE' ? 'Estás a punto de Observar esta solicitud' :
                                                 'Estás a punto de Rechazar esta solicitud'}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedAction(null)}
                                            className="text-sm underline opacity-80 hover:opacity-100"
                                            disabled={isSubmittingEval}
                                        >
                                            Cambiar
                                        </button>
                                    </div>

                                    {/* Observation / Rejection Form */}
                                    {selectedAction !== 'APPROVE' && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Motivo Principal <span className="text-red-500">*</span></label>
                                                <select 
                                                    value={selectedReasonId}
                                                    onChange={(e) => setSelectedReasonId(e.target.value)}
                                                    disabled={isSubmittingEval}
                                                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-purple-light/50 focus:border-brand-purple-light transition-all"
                                                >
                                                    <option value="" disabled>Selecciona un motivo del catálogo...</option>
                                                    {reasonsList.map((reason) => (
                                                        <option key={reason.id} value={reason.id}>{reason.description}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Notas Adicionales (Obligatorio si elige "Otro")
                                                </label>
                                                <textarea 
                                                    value={evaluationNotes}
                                                    onChange={(e) => setEvaluationNotes(e.target.value)}
                                                    disabled={isSubmittingEval}
                                                    rows={3}
                                                    placeholder="Detalla la situación para el médico..."
                                                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-purple-light/50 focus:border-brand-purple-light transition-all resize-none"
                                                ></textarea>
                                            </div>
                                        </div>
                                    )}

                                    {evalError && (
                                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2 border border-red-100">
                                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                            <p>{evalError}</p>
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-4 border-t border-slate-100">
                                        <button
                                            onClick={submitEvaluation}
                                            disabled={isSubmittingEval}
                                            className={`px-6 py-2.5 rounded-lg font-medium text-white shadow-sm transition-all focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 ${
                                                selectedAction === 'APPROVE' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' :
                                                selectedAction === 'OBSERVE' ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500' :
                                                'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                            }`}
                                        >
                                            {isSubmittingEval ? (
                                                <>
                                                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                                    Procesando...
                                                </>
                                            ) : 'Confirmar Decisión'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Read-Only Evaluation Result Block */}
                    {(requestData.current_status !== 'PENDING_CONFIRMATION' && requestData.current_status !== 'CORRECTED') && (
                        <div className={`rounded-2xl p-6 md:p-8 shadow-sm border mt-6 md:mt-10 mb-10 ${
                            requestData.current_status === 'CONFIRMED' ? 'bg-green-50/50 border-green-100' :
                            requestData.current_status === 'OBSERVED' ? 'bg-yellow-50/50 border-yellow-100' :
                            'bg-red-50/50 border-red-100'
                        }`}>
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 pb-4 border-b border-black/5 text-slate-800">
                                Resultado de Evaluación
                            </h3>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 mt-1">
                                    {requestData.current_status === 'CONFIRMED' && <CheckCircle2 className="w-8 h-8 text-green-500" />}
                                    {requestData.current_status === 'OBSERVED' && <AlertTriangle className="w-8 h-8 text-yellow-500" />}
                                    {requestData.current_status === 'REJECTED' && <XCircle className="w-8 h-8 text-red-500" />}
                                </div>
                                <div className="ml-4 w-full">
                                    <h4 className={`text-lg font-semibold ${
                                        requestData.current_status === 'CONFIRMED' ? 'text-green-800' :
                                        requestData.current_status === 'OBSERVED' ? 'text-yellow-800' :
                                        'text-red-800'
                                    }`}>
                                        {requestData.current_status === 'CONFIRMED' ? 'Solicitud Aprobada' :
                                         requestData.current_status === 'OBSERVED' ? 'Solicitud Observada' :
                                         'Solicitud Rechazada'}
                                    </h4>
                                    
                                    {requestData.current_status !== 'CONFIRMED' && requestData.evaluation_reason_description && (
                                        <div className="mt-4 space-y-3">
                                            <div>
                                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Motivo Principal</p>
                                                <p className="text-base font-semibold text-slate-800">{requestData.evaluation_reason_description}</p>
                                            </div>
                                            
                                            {requestData.evaluation_notes && (
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Notas Adicionales</p>
                                                    <p className="text-sm text-slate-700 bg-white/60 p-4 rounded-lg border border-black/5 italic">
                                                        "{requestData.evaluation_notes}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
