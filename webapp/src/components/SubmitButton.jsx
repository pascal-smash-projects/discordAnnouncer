import { useAnnouncer } from '../context/AnnouncerContext'

export default function SubmitButton() {
    const { isReadyToSend, submit, submitStatus } = useAnnouncer();

    return (
        <button
            onClick={submit}
            disabled={!isReadyToSend || submitStatus === 'sending'}
        >
            {submitStatus === 'sending' ? 'Sending...' : 'Send announcement'}
        </button>
    );
}