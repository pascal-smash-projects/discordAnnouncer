import {useState, useEffect} from 'react';
import './login.css';

export default function Login({ children }) {
    const [authed, setAuthed] = useState(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/config')
        .then((res) => setAuthed(res.ok))
        .catch(() => setAuthed(false));
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            if (res.ok) setAuthed(true);
            else setError('Invalid password');
        } catch {
            setError('Could not reach the server.');
        }
    }

    if (authed === null) return null;
    if (authed) return children;

    return (
        <div className="app-container">
            <h1>Discord Announcer Bot</h1>
            <form className="login" onSubmit={handleSubmit}>
                <label className="login-label" htmlFor="password">Please Enter password</label>
                <input
                    className="login-input"
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoFocus
                />
                {error && <div className="feedback error" role="alert">{error}</div>}
                <button className="login-button" type="submit" disabled={!password}>
                    Enter
                </button>
            </form>
        </div>
    );
}