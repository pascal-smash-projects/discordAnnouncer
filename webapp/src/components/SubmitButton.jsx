import { useAnnouncer } from '../context/AnnouncerContext'
import './SubmitButton.css'

export default function SubmitButton() {
    const { isReadyToSend, submit, submitStatus } = useAnnouncer();

    return (
        <button
            className="submit-button"
            onClick={submit}
            disabled={!isReadyToSend || submitStatus === 'sending'}
        >
            {submitStatus === 'sending' ? 'Sending...' : 'Send announcement'}
        </button>
    );
}