import { Outlet } from 'react-router-dom';
import Header from '../components/Header.js';

export default function MainLayout() {
    return (
        <div className="flex flex-col min-h-screen bg-background-light font-sans text-slate-900">
            <Header />
            <div className="flex-1 flex flex-col">
                <Outlet />
            </div>
        </div>
    );
}
