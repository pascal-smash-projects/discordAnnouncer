import {useAnnouncer} from "../context/AnnouncerContext.jsx"
import './User.css';

export default function User() {
    const { servers,
            targets,
            user,
            setUser,
    } = useAnnouncer();

    return (
        <div className="user">
            <label className='user-label' htmlFor="user">Sent From:</label>
            <input
                type="text"
                id="user"
                value={user}
                onChange={(e) => setUser(e.target.value)}
            />
        </div>
    );
}