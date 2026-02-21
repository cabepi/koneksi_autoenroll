import { useState, useEffect } from 'react';
import { Activity, ShieldCheck, UserPlus, Server } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

export default function Dashboard() {
    const { isAuthenticated, user } = useAuth();
    const [unipagoStatus, setUnipagoStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [unipagoData, setUnipagoData] = useState<any>(null);

    useEffect(() => {
        // Attempt to hit the Unipago proxy via the local Express dev server or Vercel API
        const pingUnipago = async () => {
            try {
                const res = await fetch('/api/unipago/healthz'); // Mock endpoint for example
                if (res.ok) {
                    const data = await res.json();
                    setUnipagoData(data);
                    setUnipagoStatus('success');
                } else {
                    setUnipagoStatus('error');
                }
            } catch (err) {
                setUnipagoStatus('error');
            }
        };

        // Simulating a fetch for the baseline
        setTimeout(() => {
            setUnipagoStatus('success');
            setUnipagoData({ message: 'Proxy configuration is active locally.' });
        }, 1500);
        // pingUnipago();
    }, []);

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 border-b pb-4">
                <Activity className="text-primary w-8 h-8" />
                <h2 className="text-2xl font-semibold text-gray-800">Panel de Control Global</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-4 hover:shadow-md transition-shadow">
                    <div className="bg-green-100 p-3 rounded-full text-primary">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900">Médicos Enrolados</h3>
                        <p className="text-3xl font-bold text-gray-700 mt-2">0</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-4 hover:shadow-md transition-shadow">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900">Autorizaciones</h3>
                        <p className="text-3xl font-bold text-gray-700 mt-2">0</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Server className="w-5 h-5 text-gray-500" />
                        <h3 className="font-medium text-gray-900">Estado de Red</h3>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Vercel API (Local)</span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Activo</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Unipago Proxy</span>
                            {unipagoStatus === 'loading' ? (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium animate-pulse">Cargando...</span>
                            ) : unipagoStatus === 'success' ? (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Conectado</span>
                            ) : (
                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Error</span>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Desarrollo</h3>
                <p className="text-gray-600 mb-4">
                    El servidor Express local está ejecutándose en el puerto 3001, emulando las funciones Serverless de `/api/*`. Vite delega las peticiones del backend utilizando el proxy de `vite.config.ts`.
                </p>
                <pre className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 overflow-x-auto border border-gray-200">
                    {`// Proxy Status
Status: ${unipagoStatus}
Message: ${unipagoData?.message || 'N/A'}`}
                </pre>
            </div>

        </div>
    );
}
