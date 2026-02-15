import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Navbar({ session }) {
    const navigate = useNavigate();
    const userEmail = session?.user?.email || '';
    const username = session?.user?.user_metadata?.username || userEmail.split('@')[0];

    async function handleLogout() {
        await supabase.auth.signOut();
        navigate('/login');
    }

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <div className="navbar-brand">
                    <h1>VERA<span>Chat</span></h1>
                </div>
                <div className="navbar-user">
                    <div className="user-avatar">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <span className="user-name">{username}</span>
                    <button onClick={handleLogout} className="btn btn-logout" title="Logout">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
}
