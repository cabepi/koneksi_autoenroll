export interface User {
    id: number;
    email: string;
    role: 'MEDICO' | 'CENTRO_MEDICO';
    name: string;
    createdAt?: string;
}

export interface Authorization {
    id: number;
    userId: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    details: string;
    createdAt?: string;
}

export interface MedicalSpecialty {
    slug: string;
    fallback_name: string;
}

export interface TeamMember {
    id: string;
    cedula: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    rol: string; // we will store the code here
}

export interface TeamRole {
    code: string;
    name: string;
}

export interface MedicalCenter {
    id: number;
    province: string;
    name: string;
    address: string;
    phone: string | null;
    city: string | null;
    sector: string | null;
    uuid: string | null;
}
export interface HealthInsurance {
    code: string;
    name: string;
}

export interface ProviderArsRelation {
    arsCode: string;
    arsName: string;
    providerCode: string;
    pin: string;
}
