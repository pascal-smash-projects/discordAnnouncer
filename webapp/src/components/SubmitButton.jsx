import { useAnnouncer } from '../context/AnnouncerContext'

export default function SubmitButton() {
    const { targets, isReadyToSend } = useAnnouncer();

    function handleSubmit() {
        const payload = { targets };

        console.log(JSON.stringify(payload, null, 2));
    }

    return (
        <button onClick={handleSubmit} disabled={!isReadyToSend}>
            Send announcement
        </button>
    );
}