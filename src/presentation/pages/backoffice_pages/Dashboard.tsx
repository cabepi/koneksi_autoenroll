import { useState, useEffect } from 'react';
import { Activity, Search, FileText, ChevronRight, Clock, CheckCircle, AlertCircle, FileEdit, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import BackofficeHeader from '../../components/backoffice/BackofficeHeader.js';

export default function Dashboard() {
    const { token, user, logout } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState<any[]>([]);
    const [stats, setStats] = useState({ PENDING_CONFIRMATION: 0, OBSERVED: 0, CONFIRMED: 0, REJECTED: 0, CORRECTED: 0 });
    const [activeStatus, setActiveStatus] = useState("PENDING_CONFIRMATION");
    
    // Pagination State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [pageInput, setPageInput] = useState("1"); // For manual input

    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            setIsLoading(true);
            try {
                const [statsRes, reqRes] = await Promise.all([
                    fetch('/api/backoffice/requests-stats', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`/api/backoffice/requests?status=${activeStatus}&page=${page}&limit=${limit}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (!statsRes.ok || !reqRes.ok) {
                    if (statsRes.status === 401 || reqRes.status === 401 || statsRes.status === 403 || reqRes.status === 403) {
                        logout();
                        return;
                    }
                    throw new Error('Error al obtener los datos');
                }

                const statsData = await statsRes.json();
                const reqData = await reqRes.json();
                
                setStats(statsData);
                setRequests(reqData.data || []);
                setTotalPages(reqData.meta?.totalPages || 1);
            } catch (err: any) {
                setErrorMsg(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [token, activeStatus, page, limit]);

    // Format page input string handler
    const handlePageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let targetPage = parseInt(pageInput, 10);
        if (isNaN(targetPage)) {
            setPageInput(page.toString());
            return;
        }
        if (targetPage < 1) targetPage = 1;
        if (targetPage > totalPages && totalPages > 0) targetPage = totalPages;
        
        setPage(targetPage);
        setPageInput(targetPage.toString());
    };

    // Card click handler (to reset page)
    const handleStatusChange = (newStatus: string) => {
        setActiveStatus(newStatus);
        setPage(1);
        setPageInput("1");
    };

    const getStatusBadge = (status: string | null) => {
        const config: Record<string, { bg: string, text: string, label: string }> = {
            'PENDING_CONFIRMATION': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente Confirmación' },
            'UNDER_REVIEW': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'En Revisión' },
            'OBSERVED': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Observado' },
            'CORRECTED': { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Corregido' },
            'APPROVED': { bg: 'bg-green-100', text: 'text-green-700', label: 'Aprobado' },
            'CONFIRMED': { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmado' },
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

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <button 
                        onClick={() => handleStatusChange('PENDING_CONFIRMATION')}
                        className={`p-6 rounded-xl border flex items-center justify-between transition-all text-left ${activeStatus === 'PENDING_CONFIRMATION' ? 'border-brand-purple-dark bg-white shadow-md' : 'border-slate-200 bg-white hover:border-brand-purple-light'}`}
                    >
                        <div>
                            <p className="text-sm font-semibold text-slate-500 mb-1">Pendientes</p>
                            <h3 className="text-3xl font-bold text-slate-900">{stats.PENDING_CONFIRMATION}</h3>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-xl">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                    </button>

                    <button 
                        onClick={() => handleStatusChange('OBSERVED')}
                        className={`p-6 rounded-xl border flex items-center justify-between transition-all text-left ${activeStatus === 'OBSERVED' ? 'border-brand-purple-dark bg-white shadow-md' : 'border-slate-200 bg-white hover:border-brand-purple-light'}`}
                    >
                        <div>
                            <p className="text-sm font-semibold text-slate-500 mb-1">Observados</p>
                            <h3 className="text-3xl font-bold text-slate-900">{stats.OBSERVED}</h3>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-xl">
                            <FileEdit className="w-6 h-6 text-orange-600" />
                        </div>
                    </button>

                    <button 
                        onClick={() => handleStatusChange('CORRECTED')}
                        className={`p-6 rounded-xl border flex items-center justify-between transition-all text-left ${activeStatus === 'CORRECTED' ? 'border-brand-purple-dark bg-white shadow-md' : 'border-slate-200 bg-white hover:border-brand-purple-light'}`}
                    >
                        <div>
                            <p className="text-sm font-semibold text-slate-500 mb-1">Corregidas</p>
                            <h3 className="text-3xl font-bold text-slate-900">{stats.CORRECTED}</h3>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-xl">
                            <FileText className="w-6 h-6 text-indigo-600" />
                        </div>
                    </button>
                    
                    <button 
                        onClick={() => handleStatusChange('CONFIRMED')}
                        className={`p-6 rounded-xl border flex items-center justify-between transition-all text-left ${activeStatus === 'CONFIRMED' ? 'border-brand-purple-dark bg-white shadow-md' : 'border-slate-200 bg-white hover:border-brand-purple-light'}`}
                    >
                        <div>
                            <p className="text-sm font-semibold text-slate-500 mb-1">Confirmados</p>
                            <h3 className="text-3xl font-bold text-slate-900">{stats.CONFIRMED}</h3>
                        </div>
                        <div className="p-3 bg-green-50 rounded-xl">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </button>

                    <button 
                        onClick={() => handleStatusChange('REJECTED')}
                        className={`p-6 rounded-xl border flex items-center justify-between transition-all text-left ${activeStatus === 'REJECTED' ? 'border-brand-purple-dark bg-white shadow-md' : 'border-slate-200 bg-white hover:border-brand-purple-light'}`}
                    >
                        <div>
                            <p className="text-sm font-semibold text-slate-500 mb-1">Rechazados</p>
                            <h3 className="text-3xl font-bold text-slate-900">{stats.REJECTED}</h3>
                        </div>
                        <div className="p-3 bg-red-50 rounded-xl">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </button>
                </div>

                {/* Data Grid */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5 text-brand-yellow" />
                            Historial de Registros
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-slate-500 font-medium">Mostrar:</label>
                                <select 
                                    className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-brand-purple/20 focus:border-brand-purple block w-full p-2 outline-none cursor-pointer"
                                    value={limit}
                                    onChange={(e) => {
                                        setLimit(Number(e.target.value));
                                        setPage(1); // Reset page to 1 when limit changes
                                        setPageInput("1");
                                    }}
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                            
                            {/* Pagination Controls */}
                            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
                                <button 
                                    className="p-1.5 text-slate-500 hover:text-brand-purple-dark hover:bg-brand-purple/5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    disabled={page <= 1}
                                    onClick={() => {
                                        const newPage = page - 1;
                                        setPage(newPage);
                                        setPageInput(newPage.toString());
                                    }}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                
                                <form onSubmit={handlePageSubmit} className="flex items-center">
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max={Math.max(1, totalPages)}
                                        value={pageInput}
                                        onChange={(e) => setPageInput(e.target.value)}
                                        onBlur={handlePageSubmit}
                                        className="w-12 text-center text-sm font-semibold text-slate-700 bg-transparent border-none focus:ring-0 p-0 outline-none"
                                    />
                                    <span className="text-xs text-slate-400 font-medium mr-2">/ {Math.max(1, totalPages)}</span>
                                </form>

                                <button 
                                    className="p-1.5 text-slate-500 hover:text-brand-purple-dark hover:bg-brand-purple/5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    disabled={page >= totalPages}
                                    onClick={() => {
                                        const newPage = page + 1;
                                        setPage(newPage);
                                        setPageInput(newPage.toString());
                                    }}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
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
                                                    {req.latest_status === 'PENDING_CONFIRMATION' || req.latest_status === 'CORRECTED' ? 'Evaluar' : 'Ver Detalle'}
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
