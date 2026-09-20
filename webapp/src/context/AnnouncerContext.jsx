import { createContext, useContext, useEffect, useState } from 'react'

const MAX_MESSAGE_LENGTH = 1900; //discords is 2000 but this is to allow roles
const MAX_FILES = 10;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

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
    const [configError, setConfigError] = useState('');
    const [submitStatus, setSubmitStatus] = useState('idle'); // idle | sending | done | partial | error
    const [submitError, setSubmitError] = useState('');
    const [results, setResults] = useState([]);
    const [servers, setServers] = useState([]);
    const [selections, setSelections] = useState({});
    const [message, setMessage] = useState('');
    const [user, setUser] = useState('');
    const [files, setFiles] = useState([]);  // [{ id, file }]
    const [fileErrors, setFileErrors] = useState([]);

    useEffect(() => {
        fetch('/api/config')
            .then((res) => {
                if (!res.ok) throw new Error(`Server responded with ${res.status}`);
                return res.json();
            })
            .then(setServers)
            .catch((err) => {
                console.error('Failed to load config', err);
                setConfigError('Could not load servers. Is the backend running?');
            });
    }, []);

    async function submit() {
        setSubmitStatus('sending');
        setResults([]);
        setSubmitError('');

        const payload = targets.map((target) => ({
            server: target.serverId,
            channel: target.channelId,
            roles: target.roleIds,
            message: target.message,
            user: target.user,
        }));

        try {
            const form = new FormData();
            form.append('targets', JSON.stringify(payload));
            files.forEach(({ file }) => form.append('files', file));

            const res = await fetch('/api/announce', {
                method: 'POST',
                body: form,
            });

            let data = null;
            try { data = await res.json(); } catch { /* non-JSON body */ }

            if (data?.results) {
                setResults(data.results);
                setSubmitStatus(data.failed === 0 ? 'done' : data.sent === 0 ? 'error' : 'partial');
                return;
            }

            setSubmitError(data?.error || `Request failed (${res.status})`);
            setSubmitStatus('error');
        } catch (err) {
            console.error(err);
            setSubmitError('Could not reach the server. Is it running?');
            setSubmitStatus('error');
        }
    }

    function dismissResult() {
        setSubmitStatus('idle');
        setResults([]);
        setSubmitError('');
    }

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
        user: user.trim(),
    }));

    const hasMessage = message.trim().length > 0;
    const isMessageTooLong = message.trim().length > MAX_MESSAGE_LENGTH;

    const isReadyToSend = 
        targets.length > 0 && 
        targets.every((t) => t.channelId) &&
        hasMessage &&
        !isMessageTooLong;

    function addFiles(fileList) {
        const accepted = [];
        const problems = [];

        for (const file of Array.from(fileList)) {
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                problems.push(`${file.name} isn't a supported image type`);
            } else if (file.size > MAX_FILE_BYTES) {
                problems.push(`${file.name} is larger than ${MAX_FILE_BYTES / 1024 / 1024} MB`);
            } else {
                accepted.push({ id: crypto.randomUUID(), file });
            }
        }

        if (files.length + accepted.length > MAX_FILES) {
            problems.push(`You can attach up to ${MAX_FILES} images`);
        }

        setFiles((prev) => [...prev, ...accepted].slice(0, MAX_FILES));
        setFileErrors(problems);
    }

    function removeFile(id) {
        setFiles((prev) => prev.filter((f) => f.id !== id));
        setFileErrors([]);
    }

    const value = {
        servers,
        selections,
        targets,
        message,
        setMessage,
        user,
        setUser,
        MAX_MESSAGE_LENGTH,
        isMessageTooLong,
        isReadyToSend,
        toggleServer,
        setChannel,
        toggleRole,
        configError,
        submitStatus,
        results,
        submitError,
        submit,
        dismissResult,
        files,
        addFiles,
        removeFile,
        fileErrors,
        MAX_FILES,
        ALLOWED_FILE_TYPES
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