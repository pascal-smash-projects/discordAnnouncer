import { useAnnouncer } from '../context/AnnouncerContext'

export default function Message() {
    const { servers,
            targets,
            message,
            setMessage,
            MAX_MESSAGE_LENGTH,
            isMessageTooLong
        } = useAnnouncer();
   
    const remaining = MAX_MESSAGE_LENGTH - message.trim().length;

    return (
        <div>
            <label htmlFor="message">Message</label>

            <textarea
                id="message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={6}
                placeholder="Write your announcement..."
            />

            <small style={{ color: isMessageTooLong ? 'red' : 'inherit' }}>
                {remaining} characters remaining
            </small>

            {targets.map((target) => {
                const server = servers.find((s) => s.id === target.serverId);
                const pings = target.roleIds
                    .map((id) => `@${server.roles.find((r) => r.id === id).name}`)
                    .join(' ');

                return (
                    <div key={target.serverId}>
                        <strong>{server.name}</strong>
                        {pings && <div>{pings}</div>}
                        <div>{message.trim()}</div>
                    </div>
                );
            })}
        </div>
    );
}