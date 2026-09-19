import { useAnnouncer } from '../context/AnnouncerContext'

export default function SubmitButton() {
    const { targets, isReadyToSend } = useAnnouncer();

    function handleSubmit() {
        const payload = targets.map((target) => ({
            channel: target.channelId,
            roles: target.roleIds,
            message: target.message,
            user: '',
        }));

        const response = fetch('/api/announce', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    }

    return (
        <button onClick={handleSubmit} disabled={!isReadyToSend}>
            Send announcement
        </button>
    );
}