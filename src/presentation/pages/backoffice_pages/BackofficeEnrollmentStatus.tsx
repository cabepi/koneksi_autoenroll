import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { CheckCircle2, Clock, AlertCircle, RefreshCw, XCircle, FileText, ChevronLeft, MapPin, Building2, User, Stethoscope, Mail, Phone, Home, ArrowLeft, AlertTriangle } from 'lucide-react';
import BackofficeHeader from '../../components/backoffice/BackofficeHeader.js';

export default function BackofficeEnrollmentStatus() {
    const { id } = useParams<{ id: string }>();
    const { token, logout } = useAuth();
    const [requestData, setRequestData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

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

    useEffect(() => {
        if (id && token) {
            fetchStatus();
        }
    }, [id, token]);

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
                                    const name = typeof member === 'string' ? member : member.fullName || member.name || 'Asistente';
                                    const doc = typeof member === 'string' ? undefined : member.documentId;
                                    return (
                                        <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
                                            <div className="bg-white p-2 rounded-full border border-slate-200 mt-0.5">
                                                <User className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">{name}</p>
                                                {doc && <p className="text-xs text-slate-500 mt-1">Cédula: {doc}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {requestData.ars_providers && requestData.ars_providers.length > 0 && (
                        <div className="bg-white/90 backdrop-blur rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100/50 mt-6">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">ARS Afiliadas</h3>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-wrap gap-2">
                                    {requestData.ars_providers.map((ars: any, idx: number) => (
                                        <span key={idx} className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                                            {ars.arsName} (Código: {ars.providerCode})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
