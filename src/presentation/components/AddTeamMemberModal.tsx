import { useState, useEffect } from 'react';
import { TeamMember, TeamRole } from '../../domain/types.js';

interface AddTeamMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (member: TeamMember) => void;
}

export default function AddTeamMemberModal({ isOpen, onClose, onSave }: AddTeamMemberModalProps) {
    const [cedula, setCedula] = useState("");
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [rol, setRol] = useState("");

    const [rolesOptions, setRolesOptions] = useState<TeamRole[]>([]);
    const [isLoadingRoles, setIsLoadingRoles] = useState(false);

    useEffect(() => {
        if (isOpen && rolesOptions.length === 0) {
            const fetchRoles = async () => {
                setIsLoadingRoles(true);
                try {
                    const response = await fetch('/api/team-roles');
                    if (response.ok) {
                        const data = await response.json();
                        setRolesOptions(data);
                    } else {
                        console.error('Failed to fetch team roles');
                    }
                } catch (error) {
                    console.error('Error fetching team roles:', error);
                } finally {
                    setIsLoadingRoles(false);
                }
            };

            fetchRoles();
        }
    }, [isOpen, rolesOptions.length]);

    if (!isOpen) return null;

    const formatCedula = (value: string) => {
        const numbers = value.replace(/\D/g, '').slice(0, 11);
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 10) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 10)}-${numbers.slice(10)}`;
    };

    const formatTelefono = (value: string) => {
        const numbers = value.replace(/\D/g, '').slice(0, 10);
        if (numbers.length === 0) return '';
        if (numbers.length <= 3) return `+1 (${numbers}`;
        if (numbers.length <= 6) return `+1 (${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
        return `+1 (${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    };

    const handleSave = () => {
        // Basic validation
        if (!cedula || !nombre || !apellido || !email || !telefono || !rol) {
            alert("Por favor complete todos los campos obligatorios.");
            return;
        }

        const newMember: TeamMember = {
            id: crypto.randomUUID(), // Assuming modern browser context
            cedula,
            nombre,
            apellido,
            email,
            telefono,
            rol,
        };

        onSave(newMember);

        // Reset state
        setCedula("");
        setNombre("");
        setApellido("");
        setEmail("");
        setTelefono("");
        setRol("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">Agregar Miembro</h2>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-md">
                            Ingrese los detalles del miembro de su equipo que le gustaría invitar a la plataforma. Recibirán un correo electrónico de invitación para configurar su cuenta.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body / Form */}
                <div className="p-6 space-y-5">
                    {/* Cédula */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-900">Número de Cédula</label>
                        <input
                            type="text"
                            value={cedula}
                            onChange={(e) => setCedula(formatCedula(e.target.value))}
                            placeholder="p. ej. 001-0000000-0"
                            maxLength={13}
                            className="w-full bg-white border border-slate-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-700 placeholder:text-slate-300"
                        />
                    </div>

                    {/* Name / Last Name Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-900">Nombre</label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-700 placeholder:text-slate-300"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-900">Apellido</label>
                            <input
                                type="text"
                                value={apellido}
                                onChange={(e) => setApellido(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-700 placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-900">Dirección de Correo Electrónico</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400">mail</span>
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="a.gonzalez@icloud.com"
                                className="w-full bg-white border border-slate-300 rounded-lg py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-700 placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-900">Número de Teléfono</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400">call</span>
                            </div>
                            <input
                                type="tel"
                                value={telefono}
                                onChange={(e) => setTelefono(formatTelefono(e.target.value))}
                                placeholder="+1 (809) 000-0000"
                                maxLength={17}
                                className="w-full bg-white border border-slate-300 rounded-lg py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-700 placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    {/* Role */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-900">Rol y Permisos</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400">admin_panel_settings</span>
                            </div>
                            <select
                                value={rol}
                                onChange={(e) => setRol(e.target.value)}
                                disabled={isLoadingRoles}
                                className={`w-full bg-white border border-slate-300 rounded-lg py-3 pl-12 pr-10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none ${rol ? 'text-slate-700' : 'text-slate-400'}`}
                            >
                                <option value="" disabled>
                                    {isLoadingRoles ? "Cargando roles..." : "Seleccione un rol"}
                                </option>
                                {rolesOptions.map((roleOption) => (
                                    <option key={roleOption.code} value={roleOption.code}>
                                        {roleOption.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400">expand_more</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50/50 flex items-center justify-end gap-6 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="text-slate-600 font-bold hover:text-slate-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-[#EAB308] hover:bg-[#CA8A04] text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-all shadow-md transform hover:-translate-y-0.5"
                    >
                        <span className="material-symbols-outlined text-xl">send</span>
                        Guardar Asistente
                    </button>
                </div>
            </div>
        </div>
    );
}
