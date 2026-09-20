import { useEffect, useRef, useState } from 'react'
import { useAnnouncer } from '../context/AnnouncerContext'
import './Attachments.css'

function Thumbnail({ file }) {
    const [url, setUrl] = useState('');

    useEffect(() => {
        const objectUrl = URL.createObjectURL(file);
        setUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    return url
        ? <img className="attachment-thumb" src={url} alt="" />
        : <div className="attachment-thumb" />;
}

function formatSize(bytes) {
    return bytes >= 1024 * 1024
        ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
        : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function Attachments() {
    const { files, addFiles, removeFile, fileErrors, MAX_FILES, ALLOWED_FILE_TYPES } = useAnnouncer();
    const inputRef = useRef(null);

    function handleChange(event) {
        addFiles(event.target.files);
        event.target.value = ''; // so picking the same file again still fires onChange
    }

    return (
        <div className="attachments">
            <div className="attachments-header">
                <span className="attachments-label">Attachments</span>
                <span className="attachments-count">{files.length}/{MAX_FILES}</span>
            </div>

            <input
                ref={inputRef}
                type="file"
                multiple
                hidden
                accept={ALLOWED_FILE_TYPES.join(',')}
                onChange={handleChange}
            />

            <button
                type="button"
                className="attachments-add"
                onClick={() => inputRef.current.click()}
                disabled={files.length >= MAX_FILES}
            >
                Add images
            </button>

            {fileErrors.map((error) => (
                <div className="attachments-error" role="alert" key={error}>{error}</div>
            ))}

            {files.length > 0 && (
                <ul className="attachments-list">
                    {files.map(({ id, file }) => (
                        <li className="attachment-row" key={id}>
                            <Thumbnail file={file} />
                            <div className="attachment-info">
                                <span className="attachment-name">{file.name}</span>
                                <span className="attachment-size">{formatSize(file.size)}</span>
                            </div>
                            <button
                                type="button"
                                className="attachment-remove"
                                onClick={() => removeFile(id)}
                                aria-label={`Remove ${file.name}`}
                            >
                                ✕
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}