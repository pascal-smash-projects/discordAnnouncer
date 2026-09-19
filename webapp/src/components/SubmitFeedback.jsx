import { useAnnouncer } from '../context/AnnouncerContext'

const SUMMARY = {
    done: 'Announcement sent to every selected server.',
    partial: 'Some servers failed. The ones marked ✗ did not receive it.',
    error: 'The announcement could not be sent.',
};

export default function SubmitFeedback() {
    const { submitStatus, results, submitError, dismissResult } = useAnnouncer();

    if (submitStatus === 'idle' || submitStatus === 'sending') return null;

    const isSuccess = submitStatus === 'done';

    return (
        <div className={isSuccess ? 'feedback success' : 'feedback error'} role={isSuccess ? 'status' : 'alert'}>
            <strong>{submitError || SUMMARY[submitStatus]}</strong>

            {results.length > 0 && (
                <ul>
                    {results.map((r) => (
                        <li key={`${r.server}-${r.channel}`}>
                            {r.status === 'sent' ? '✓' : '✗'} {r.server} #{r.channel}
                            {r.status === 'failed' && `: ${r.error}`}
                        </li>
                    ))}
                </ul>
            )}

            <button type="button" onClick={dismissResult}>Dismiss</button>
        </div>
    );
}