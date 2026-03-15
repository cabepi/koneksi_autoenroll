import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, AlertTriangle, ArrowLeft } from 'lucide-react';

interface EnrollmentDetail {
    id: string;
    identification_number: string;
    full_name: string;
    email: string;
    phone: string;
    specialties: any[];
    team_members: any[];
    medical_centers: any[];
    ars_providers: any[];
    created_at: string;
    current_status: string;
    registration_date?: string;
    exequatur?: string;
    biometric_url?: string;
    evaluation_notes?: string;
    evaluation_reason_description?: string;
}

export const EnrollmentStatus: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<EnrollmentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    console.log("EnrollmentStatus mounted for id:", id);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch(`/api/enrollment-requests/${id}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('No pudimos encontrar la solicitud con este identificador.');
                    }
                    throw new Error('Hubo un problema al consultar el estado de la solicitud.');
                }
                const json = await response.json();
                setData(json);
            } catch (err: any) {
                console.error("Error fetching enrollment data:", err);
                setError(err.message || 'Error de conexión');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchStatus();
        }
    }, [id]);

    const getStatusConfig = (status?: string) => {
        if (!status) {
            return {
                label: 'Estado Desconocido',
                color: 'bg-gray-100 text-gray-800',
                icon: <AlertTriangle className="w-12 h-12 text-gray-400 mb-4 mx-auto" />,
                description: 'La solicitud fue recibida, pero aún no se le ha asignado un estado visible.'
            };
        }

        switch (status) {
            case 'PENDING_CONFIRMATION':
                return {
                    label: 'En Revisión',
                    color: 'bg-blue-100 text-blue-800',
                    icon: <Clock className="w-12 h-12 text-blue-500 mb-4 mx-auto" />,
                    description: 'Tu solicitud ha sido recibida y se encuentra actualmente en revisión por nuestro equipo.'
                };
            case 'OBSERVED':
                return {
                    label: 'Solicitud Observada',
                    color: 'bg-yellow-100 text-yellow-800',
                    icon: <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4 mx-auto" />,
                    description: 'Hay algunas observaciones sobre tu solicitud que requieren tu atención. Revisa los detalles abajo.'
                };
            case 'CORRECTED':
                return {
                    label: 'Ajustes Recibidos',
                    color: 'bg-blue-100 text-blue-800',
                    icon: <CheckCircle className="w-12 h-12 text-blue-500 mb-4 mx-auto" />,
                    description: 'Tus correcciones y ajustes han sido recibidos. Nuestro equipo los revisará a la brevedad posible.'
                };
            case 'APPROVED':
                return {
                    label: 'Solicitud Aprobada',
                    color: 'bg-green-100 text-green-800',
                    icon: <CheckCircle className="w-12 h-12 text-green-500 mb-4 mx-auto" />,
                    description: '¡Felicidades! Tu solicitud ha sido aprobada exitosamente. Pronto recibirás las instrucciones de acceso a la plataforma.'
                };
            case 'REJECTED':
                return {
                    label: 'Solicitud Rechazada',
                    color: 'bg-red-100 text-red-800',
                    icon: <XCircle className="w-12 h-12 text-red-500 mb-4 mx-auto" />,
                    description: 'Lamentablemente tu solicitud no cumple con los requisitos actuales. Hemos enviado un correo con los detalles del motivo.'
                };
            default:
                return {
                    label: 'Estado Desconocido',
                    color: 'bg-gray-100 text-gray-800',
                    icon: <AlertTriangle className="w-12 h-12 text-gray-400 mb-4 mx-auto" />,
                    description: 'Verificando el estado actual de la solicitud...'
                };
        }
    };

    const handleAdjustRequest = () => {
        // Redirect directly to the dedicated adjustment screen
        navigate(`/adjust-request/${id}`);
    };

    console.log("EnrollmentStatus rendering state: ", { loading, error, data });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className="mt-4 text-gray-600">Consultando estado de la solicitud...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
                <div className="w-full max-w-md text-center bg-white rounded-lg shadow-sm border p-8">
                    <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Solicitud No Encontrada</h2>
                    <p className="text-gray-600 mb-6">{error || 'No pudimos cargar los detalles solicitados.'}</p>
                    <Link to="/" className="text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Volver al Inicio
                    </Link>
                </div>
            </div>
        );
    }

    const config = getStatusConfig(data.current_status);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-3xl space-y-6">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Estado de Solicitud</h1>
                    <p className="mt-2 text-sm text-gray-500">ID de Rastreo: {data.id.split('-')[0]}***</p>
                </div>

                <div className="bg-white rounded-lg border-t-4 border-t-purple-600 shadow-lg p-10 text-center">
                    {config.icon}
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{config.label}</h2>
                    <p className="text-gray-600">{config.description}</p>
                </div>

                {data.current_status === 'OBSERVED' && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg shadow-md mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="h-6 w-6 text-yellow-500" aria-hidden="true" />
                            </div>
                            <div className="ml-3 w-full">
                                <h3 className="text-lg font-medium text-yellow-800">Causal de Observación</h3>
                                <div className="mt-2 text-sm text-yellow-700 space-y-2">
                                    <p className="font-semibold">{data.evaluation_reason_description}</p>
                                    {data.evaluation_notes && (
                                        <p className="bg-yellow-100/50 p-3 rounded-md border border-yellow-200/50 italic">"{data.evaluation_notes}"</p>
                                    )}
                                </div>
                                <div className="mt-6">
                                    <button
                                        onClick={handleAdjustRequest}
                                        className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-yellow-700 shadow-sm ring-1 ring-inset ring-yellow-300 hover:bg-yellow-50 transition-colors"
                                    >
                                        Ajustar mi Solicitud
                                    </button>
                                    <p className="text-xs text-yellow-600 mt-3">Al presionar ajustar, regresará al inicio con sus datos precargados para modificarlos.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {data.current_status === 'REJECTED' && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg shadow-md mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <XCircle className="h-6 w-6 text-red-500" aria-hidden="true" />
                            </div>
                            <div className="ml-3 w-full">
                                <h3 className="text-lg font-medium text-red-800">Motivo de Rechazo</h3>
                                <div className="mt-2 text-sm text-red-700 space-y-2">
                                    <p className="font-semibold">{data.evaluation_reason_description}</p>
                                    {data.evaluation_notes && (
                                        <p className="bg-red-100/50 p-3 rounded-md border border-red-200/50 italic">"{data.evaluation_notes}"</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Detalles del Solicitante</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900">{data.full_name}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula / Identificación</p>
                            <p className="mt-1 text-sm text-gray-900">{data.identification_number}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Correo Electrónico</p>
                            <p className="mt-1 text-sm text-gray-900">{data.email}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</p>
                            <p className="mt-1 text-sm text-gray-900">{data.phone}</p>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Especialidades Registradas</p>
                            <div className="flex flex-wrap gap-2">
                                {data.specialties && data.specialties.length > 0 ? (
                                    data.specialties.map((spec: any, idx: number) => {
                                        const label = typeof spec === 'string' ? spec : (spec.name || spec.fallback_name || spec.slug || JSON.stringify(spec));
                                        return (
                                            <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {label}
                                            </span>
                                        );
                                    })
                                ) : (
                                    <span className="text-sm text-gray-500">Ninguna especificada</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {data.team_members && data.team_members.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Personal de Soporte (Equipo Médico)</h3>
                        </div>
                        <div className="p-0">
                            <ul className="divide-y divide-gray-100">
                                {data.team_members.map((member: any, idx: number) => (
                                    <li key={idx} className="px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                        <div>
                                            <p className="font-medium text-gray-900">{member.nombre} {member.apellido}</p>
                                            <p className="text-sm text-gray-500">{member.email} | {member.telefono}</p>
                                        </div>
                                        <div className="mt-2 sm:mt-0">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {member.rol}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {data.medical_centers && data.medical_centers.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Centros Médicos</h3>
                        </div>
                        <div className="p-0">
                            <ul className="divide-y divide-gray-100">
                                {data.medical_centers.map((center: any, idx: number) => (
                                    <li key={idx} className="px-6 py-4">
                                        <p className="font-medium text-gray-900">{center.name || center.nombre}</p>
                                        <p className="text-sm text-gray-500">{center.address} - {center.province}</p>
                                        <p className="text-sm text-gray-500">{center.phone}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {data.ars_providers && data.ars_providers.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">ARS Afiliadas</h3>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-wrap gap-2">
                                {data.ars_providers.map((ars: any, idx: number) => (
                                    <span key={idx} className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                                        {ars.arsName} (Código: {ars.providerCode})
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}


                <div className="text-center mt-8">
                    <Link to="/" className="text-sm font-medium text-purple-600 hover:text-purple-500 hover:underline">
                        &larr; Volver a la página principal
                    </Link>
                </div>
            </div>
        </div>
    );
};
