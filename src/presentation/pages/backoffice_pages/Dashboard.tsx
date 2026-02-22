import { useState, useEffect } from 'react';
import { Activity, Search, FileText, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import BackofficeHeader from '../../components/backoffice/BackofficeHeader.js';

export default function Dashboard() {
    const { token, user, logout } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const fetchRequests = async () => {
            if (!token) return;

            try {
                const res = await fetch('/api/backoffice/requests', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    if (res.status === 401 || res.status === 403) {
                        logout();
                        return;
                    }
                    throw new Error('Error al obtener los datos');
                }

                const data = await res.json();
                setRequests(data);
            } catch (err: any) {
                setErrorMsg(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, [token]);

    const getStatusBadge = (status: string | null) => {
        const config: Record<string, { bg: string, text: string, label: string }> = {
            'PENDING_CONFIRMATION': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente Confirmación' },
            'UNDER_REVIEW': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'En Revisión' },
            'APPROVED': { bg: 'bg-green-100', text: 'text-green-700', label: 'Aprobado' },
            'REJECTED': { bg: 'bg-red-100', text: 'text-red-700', label: 'Rechazado' },
        };

        const activeStatus = config[status || ''] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status || 'Desconocido' };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${activeStatus.bg} ${activeStatus.text}`}>
                {activeStatus.label}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-DO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <BackofficeHeader />

            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12 w-full px-4 sm:px-6 lg:px-8 mt-8">
                {/* Header / KPI Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                            <Activity className="text-brand-purple-dark w-8 h-8" />
                            Panel de Solicitudes
                        </h2>
                        <p className="text-slate-500 mt-2">
                            Bienvenido, <span className="font-semibold text-slate-700">{user?.name}</span>. Aquí tienes un resumen de las últimas solicitudes de enrolamiento.
                        </p>
                    </div>
                </div>

                {/* Error Message */}
                {errorMsg && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
                        <span className="material-symbols-outlined mb-0">error</span>
                        {errorMsg}
                    </div>
                )}

                {/* Data Grid */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5 text-brand-yellow" />
                            Historial de Registros
                        </h3>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar solicitud..."
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all"
                                disabled // Placeholder for future search functionality
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                                <tr>
                                    <th scope="col" className="px-6 py-4 font-semibold">Solicitante</th>
                                    <th scope="col" className="px-6 py-4 font-semibold">Correo Electrónico</th>
                                    <th scope="col" className="px-6 py-4 font-semibold">Fecha de Ingreso</th>
                                    <th scope="col" className="px-6 py-4 font-semibold">Estado Actual</th>
                                    <th scope="col" className="px-6 py-4 font-semibold text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-brand-purple-dark animate-spin"></div>
                                                Cargando solicitudes...
                                            </div>
                                        </td>
                                    </tr>
                                ) : requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            No hay solicitudes de enrolamiento registradas en el sistema.
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((req) => (
                                        <tr
                                            key={req.id}
                                            onClick={() => navigate(`/backoffice/enrollment-status/${req.id}`)}
                                            className="bg-white border-b border-slate-50 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {req.full_name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {req.email}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                                {formatDate(req.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(req.latest_status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end text-brand-purple-light group-hover:text-brand-purple-dark transition-colors font-medium text-xs gap-1">
                                                    Ver detalle
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
