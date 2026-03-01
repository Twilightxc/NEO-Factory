import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BarChart3,
    Settings,
    LogOut,
    User
} from 'lucide-react';
import { useStore } from '../../store/useStore';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { isDarkMode, auth, logout } = useStore();

    const [isHovered, setIsHovered] = useState(false);
    const isExpanded = isHovered;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
                ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}
                border-r transition-all duration-300 ease-in-out h-screen sticky top-0 flex flex-col
                ${isExpanded ? 'w-80' : 'w-24'} 
                z-50 shadow-2xl
            `}
        >
            {/* Header Section */}
            <div className="p-8 border-b border-slate-800 flex items-center h-28 overflow-hidden">
                {isExpanded ? (
                    <h1 className={`text-2xl font-black tracking-tighter whitespace-nowrap ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        NEO-FACTORY
                    </h1>
                ) : (
                    <div className="w-full flex justify-center">
                        <span className="text-2xl font-black text-blue-500">NF</span>
                    </div>
                )}
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-4 space-y-4 mt-4 overflow-hidden">
                {[
                    { id: 'db', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
                    { id: 'an', label: 'Analytics', icon: BarChart3, path: '/analytics' },
                    { id: 'st', label: 'Settings', icon: Settings, path: '/settings' },
                ].map((item) => (
                    <Link
                        key={item.id}
                        to={item.path}
                        className={`flex items-center gap-5 p-5 rounded-2xl transition-all
                            ${location.pathname === item.path
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                                : 'text-slate-400 hover:bg-slate-800'}
                            ${!isExpanded && 'justify-center'}`}
                    >
                        <item.icon className="w-8 h-8 flex-shrink-0" />
                        {isExpanded && <span className="text-xl font-bold tracking-tight whitespace-nowrap">{item.label}</span>}
                    </Link>
                ))}
            </nav>

            {/* Bottom Section - ปรับจากตัวอักษรเป็นไอคอน User */}
            <div className="p-4 border-t border-slate-800 space-y-4">

                <div className={`
                    flex items-center rounded-2xl transition-all duration-300
                    ${isExpanded
                        ? 'p-4 bg-slate-800/50 justify-between'
                        : 'p-2 justify-center bg-transparent'
                    }
                `}>
                    {/* ส่วนซ้าย: ไอคอน User และชื่อ */}
                    <div className="flex items-center gap-4 overflow-hidden">
                        {/* 🚩 เปลี่ยนจากตัวอักษร J เป็นไอคอน User */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-inner flex-shrink-0">
                            <User size={28} strokeWidth={2.5} />
                        </div>
                        {isExpanded && (
                            <p className="text-lg font-bold text-white truncate whitespace-nowrap">
                                {auth.firstName} {auth.lastName}
                            </p>
                        )}
                    </div>

                    {/* ส่วนขวา: ไอคอน Logout */}
                    {isExpanded && (
                        <button
                            onClick={handleLogout}
                            className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-400/10 flex-shrink-0"
                            title="Logout"
                        >
                            <LogOut size={24} />
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;