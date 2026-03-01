import React from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const { setAuth } = useStore();
    const navigate = useNavigate();

    const handleFakeLogin = () => {

        setAuth({ token: 'dummy-token', firstName: 'Neo', lastName: 'Officer' });
        navigate('/');
    };

    return (
        <div className="h-screen flex items-center justify-center bg-slate-950">
            <button
                onClick={handleFakeLogin}
                className="px-12 py-5 bg-blue-600 text-white text-3xl font-black rounded-3xl hover:bg-blue-500 shadow-2xl shadow-blue-500/20 transition-all"
            >
                START NEO-FACTORY SYSTEM
            </button>
        </div>
    );
};

export default LoginPage;