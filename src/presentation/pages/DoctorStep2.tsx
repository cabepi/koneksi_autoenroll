import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RegistrationStepper from '../components/RegistrationStepper.js';
import AddTeamMemberModal from '../components/AddTeamMemberModal.js';
import { TeamMember, MedicalCenter } from '../../domain/types.js';

export default function DoctorStep2() {
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

    // Medical Centers State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MedicalCenter[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedCenters, setSelectedCenters] = useState<MedicalCenter[]>([]);

    const STORAGE_KEY_TEAM = 'koneksi_team_members';
    const STORAGE_KEY_CENTERS = 'koneksi_selected_centers';

    // Hydrate members from local storage
    useEffect(() => {
        const savedTeam = localStorage.getItem(STORAGE_KEY_TEAM);
        if (savedTeam) {
            try {
                const parsed = JSON.parse(savedTeam);
                if (Array.isArray(parsed)) setTeamMembers(parsed);
            } catch (err) {
                console.error("Error parsing saved team members", err);
            }
        }

        const savedCenters = localStorage.getItem(STORAGE_KEY_CENTERS);
        if (savedCenters) {
            try {
                const parsed = JSON.parse(savedCenters);
                if (Array.isArray(parsed)) setSelectedCenters(parsed);
            } catch (err) {
                console.error("Error parsing saved centers", err);
            }
        }
    }, []);

    // Save members tracking
    useEffect(() => {
        if (teamMembers.length > 0) {
            localStorage.setItem(STORAGE_KEY_TEAM, JSON.stringify(teamMembers));
        } else {
            localStorage.removeItem(STORAGE_KEY_TEAM);
        }
    }, [teamMembers]);

    // Save selected centers tracking
    useEffect(() => {
        if (selectedCenters.length > 0) {
            localStorage.setItem(STORAGE_KEY_CENTERS, JSON.stringify(selectedCenters));
        } else {
            localStorage.removeItem(STORAGE_KEY_CENTERS);
        }
    }, [selectedCenters]);

    // Search Medical Centers Debounce Logic
    useEffect(() => {
        if (searchQuery.length < 4) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await fetch(`/api/medical-centers?q=${encodeURIComponent(searchQuery)}`);
                if (response.ok) {
                    const data = await response.json();
                    setSearchResults(data);
                } else {
                    console.error("Failed to fetch medical centers");
                    setSearchResults([]);
                }
            } catch (error) {
                console.error("API error", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 400); // 400ms debounce

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSelectCenter = (center: MedicalCenter) => {
        // Prevent duplicates
        if (!selectedCenters.find(c => c.id === center.id)) {
            setSelectedCenters(prev => [...prev, center]);
        }
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleRemoveCenter = (id: number) => {
        setSelectedCenters(prev => prev.filter(c => c.id !== id));
    };

    const handleSaveMember = (newMember: TeamMember) => {
        setTeamMembers((prev) => [...prev, newMember]);
        setIsAddMemberModalOpen(false);
    };

    const handleDeleteMember = (id: string) => {
        setTeamMembers((prev) => prev.filter(member => member.id !== id));
    };

    const getRoleAcronym = (name: string, surname: string) => {
        return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
    };

    const getRandomColorClass = (index: number) => {
        const colors = [
            'bg-blue-100 text-blue-600',
            'bg-green-100 text-green-600',
            'bg-purple-100 text-purple-600',
            'bg-brand-yellow/20 text-brand-yellow-dark',
            'bg-pink-100 text-pink-600'
        ];
        return colors[index % colors.length];
    };
    return (
        <div className="flex flex-col min-h-screen bg-background-light text-slate-900">
            <RegistrationStepper currentStep={2} />

            <main className="flex-grow px-4 md:px-20 lg:px-40 py-10">
                <div className="max-w-4xl mx-auto">
                    {/* Header Area */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-slate-900 text-4xl font-bold mb-2 tracking-tight">Equipo y Centros Médicos</h1>
                            <p className="text-slate-600 text-lg">
                                Agrega al personal de trabajo autorizado y vincula de forma segura los centros médicos donde ejerces.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Optional contextual hints or actions */}
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        {/* Left Column: Team */}
                        <div className="bg-white rounded-xl custom-shadow border border-slate-200 overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                        <span className="material-symbols-outlined">group</span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">Mi Equipo de Trabajo</h2>
                                        <p className="text-xs text-slate-500">Asistentes y personal administrativo</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsAddMemberModalOpen(true)}
                                    className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span> Add
                                </button>
                            </div>

                            <div className="p-6 flex-grow bg-slate-50/50">
                                <div className="space-y-3">
                                    {teamMembers.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <span className="material-symbols-outlined text-slate-400 text-2xl">person_add</span>
                                            </div>
                                            <p className="text-slate-500 font-medium">Aún no has agregado miembros a tu equipo.</p>
                                            <p className="text-slate-400 text-sm mt-1">Haz clic en Add para comenzar.</p>
                                        </div>
                                    ) : (
                                        teamMembers.map((member, index) => (
                                            <div key={member.id} className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${getRandomColorClass(index)}`}>
                                                    {getRoleAcronym(member.nombre, member.apellido)}
                                                </div>
                                                <div className="flex-grow">
                                                    <h4 className="font-bold text-slate-800 text-sm">{member.nombre} {member.apellido}</h4>
                                                    <p className="text-xs text-slate-500">{member.rol}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteMember(member.id)}
                                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                                    title="Eliminar miembro"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Medical Centers Full Box Redesign */}
                        <div className="bg-white rounded-2xl custom-shadow border border-slate-100 p-8">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-slate-900 mb-1">Centros Médicos y Clínicas</h2>
                                <p className="text-slate-500 text-sm">Busca y vincula las instalaciones donde consultas actualmente.</p>
                            </div>

                            <div className="mb-8 relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Busca el centro médico por nombre, o dirección..."
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all font-medium text-slate-700 placeholder:font-normal"
                                />
                                {isSearching && (
                                    <div className="absolute right-4 top-4">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-yellow"></div>
                                    </div>
                                )}

                                {/* Search Results Dropdown */}
                                {searchResults.length > 0 && (
                                    <div className="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-lg border border-slate-100 max-h-64 overflow-y-auto">
                                        {searchResults.map(center => (
                                            <div
                                                key={`search-${center.id}`}
                                                className="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                                                onClick={() => handleSelectCenter(center)}
                                            >
                                                <h4 className="font-bold text-slate-800 text-sm">{center.name}</h4>
                                                <p className="text-xs text-slate-500 mt-1">{center.address}, {center.province}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {searchQuery.length >= 4 && !isSearching && searchResults.length === 0 && (
                                    <div className="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-lg border border-slate-100 p-4 text-center">
                                        <p className="text-slate-500 text-sm">No se encontraron centros coincidiendo con tu búsqueda.</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 mb-8">
                                {selectedCenters.length === 0 ? (
                                    <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <p className="text-slate-400 text-sm">No has vinculado ningún centro médico aún.</p>
                                    </div>
                                ) : (
                                    selectedCenters.map((center, index) => {
                                        // Alternate styles based on index for visual variety like the mockup
                                        const isEven = index % 2 === 0;
                                        return (
                                            <div key={`selected-${center.id}`} className={`flex items-center gap-5 p-4 rounded-xl border shadow-sm transition-all ${isEven ? 'border-brand-yellow/30 bg-orange-50/20' : 'border-slate-100 bg-white'}`}>
                                                <div className={`w-14 h-14 rounded-xl border flex items-center justify-center flex-shrink-0 ${isEven ? 'border-slate-100 bg-white shadow-sm' : 'border-slate-100 bg-slate-50'}`}>
                                                    <span className={`material-symbols-outlined text-[28px] ${isEven ? 'text-brand-yellow' : 'text-brand-purple/70'}`}>
                                                        {isEven ? 'apartment' : 'medical_services'}
                                                    </span>
                                                </div>
                                                <div className="flex-grow">
                                                    <h3 className="font-bold text-slate-900 text-base mb-1">{center.name}</h3>
                                                    <div className="flex items-center text-slate-500 text-sm">
                                                        <span className="material-symbols-outlined text-[16px] mr-1">location_on</span>
                                                        {center.address}, {center.province}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveCenter(center.id)}
                                                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                                                    title="Desvincular centro"
                                                >
                                                    <span className="material-symbols-outlined text-[26px]">close</span>
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-10">
                        <Link to="/register/doctor-step-1" className="flex items-center gap-2 text-brand-purple font-bold hover:underline">
                            <span className="material-symbols-outlined">arrow_back</span>
                            Volver
                        </Link>

                        <Link
                            to={teamMembers.length > 0 && selectedCenters.length > 0 ? "/register/doctor-step-3" : "#"}
                            className={`px-10 py-4 rounded-xl font-bold flex items-center gap-4 transition-all shadow-md ${teamMembers.length > 0 && selectedCenters.length > 0 ? 'bg-brand-yellow text-white hover:bg-opacity-90' : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-70'}`}
                            onClick={(e) => {
                                if (teamMembers.length === 0 || selectedCenters.length === 0) e.preventDefault();
                            }}
                        >
                            Continuar
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </main>

            <AddTeamMemberModal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                onSave={handleSaveMember}
            />
        </div>
    );
}
