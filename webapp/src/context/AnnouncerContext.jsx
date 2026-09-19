import { createContext, useContext, useEffect, useState } from 'react'

const MAX_MESSAGE_LENGTH = 1900; //discords is 2000 but this is to allow roles

const AnnouncerContext = createContext(null);

//Deprecated AF by Hitlerscal
/* 
function buildContent(message, roleIds) {
    const pings = roleIds.map((id) => `<@&${id}>`).join(' ');
    const text = message.trim();
    return pings ? `${pings}\n${text}` : text;
}
*/

export function AnnouncerProvider({ children }) {
    const [servers, setServers] = useState([]);
    const [selections, setSelections] = useState({});
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/config')
            .then((res) => res.json())
            .then(setServers)
            .catch((err) => console.error('Failed to load config', err));
    }, []);

    function toggleServer(serverId) {
        setSelections((prev) => {
            const next = { ...prev };
            if (serverId in next) {
                delete next[serverId];
            } else {
                next[serverId] = { channelId: '', roleIds: [] };
            }
            return next;
        });
    }

    function setChannel(serverId, channelId) {
        setSelections((prev) => ({
            ...prev,
            [serverId]: { ...prev[serverId], channelId },
        }));
    }

    function toggleRole(serverId, roleId) {
        setSelections((prev) => {
            const current = prev[serverId];
            const roleIds = current.roleIds.includes(roleId)
                ? current.roleIds.filter((id) => id !== roleId)
                : [...current.roleIds, roleId];
            return { ...prev, [serverId]: { ...current, roleIds } };
        });
    }

    const targets = Object.entries(selections).map(([serverId, selection]) => ({
        serverId,
        channelId: selection.channelId,
        roleIds: selection.roleIds,
        message: message.trim(),
    }));

    const hasMessage = message.trim().length > 0;
    const isMessageTooLong = message.trim().length > MAX_MESSAGE_LENGTH;

    const isReadyToSend = 
        targets.length > 0 && 
        targets.every((t) => t.channelId) &&
        hasMessage &&
        !isMessageTooLong;

    const value = {
        servers,
        selections,
        targets,
        message,
        setMessage,
        MAX_MESSAGE_LENGTH,
        isMessageTooLong,
        isReadyToSend,
        toggleServer,
        setChannel,
        toggleRole,
    };

    return (
        <AnnouncerContext.Provider value={value}>
            {children}
        </AnnouncerContext.Provider>
    );
}

export function useAnnouncer() {
    const context = useContext(AnnouncerContext);
    if (!context) {
        throw new Error('useAnnouncer must be used inside an AnnouncerProvider');
    }
    return context;
}