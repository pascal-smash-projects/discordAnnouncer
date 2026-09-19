import { createContext, useContext, useState } from 'react'

const servers = [
    {
        id: "1",
        name: "SSBU Ireland",
        channels: [
            { id: "101", name: "announcements" },
            { id: "102", name: "tournaments" },
        ],
        roles: [
            { id: "901", name: "TO" },
            { id: "902", name: "Head TO" },
        ],
    },
    {
        id: "2",
        name: "SSBU Melee",
        channels: [
            { id: "101", name: "announcements" },
            { id: "102", name: "tournaments" },
        ],
        roles: [
            { id: "901", name: "melee is actually a better game" },
            { id: "902", name: "LMOA ult also i smell really bad" },
        ],
    },
    {
        id: "3",
        name: "The North Awakens",
        channels: [
            { id: "101", name: "announcements" },
            { id: "102", name: "tournaments" },
        ],
        roles: [
            { id: "901", name: "Big Fish" },
            { id: "902", name: "Big Fish TO" },
        ],
    },
];

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
    const [selections, setSelections] = useState({});
    const [message, setMessage] = useState('');

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