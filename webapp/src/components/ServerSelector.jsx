import { useAnnouncer } from '../context/AnnouncerContext';
import './ServerSelector.css';

export default function ServerSelector() {
    const { servers, selections, configError, toggleServer, setChannel, toggleRole } = useAnnouncer();

    if (configError) {
        return <div className="feedback error" role="alert">{configError}</div>;
    }

    return (
        <div className="server-selector">
            <h2 className="server-section-title">Send to...</h2>

            {servers.map((server) => {
                const selection = selections[server.id];
                const isSelected = selection !== undefined;

                return (
                    <div key={server.id}>
                        <label className="server-row">
                            <span className="server-row-name">{server.name}</span>
                            <input
                                type="checkbox"
                                className="server-checkbox"
                                checked={isSelected}
                                onChange={() => toggleServer(server.id)}
                            />
                        </label>

                        {isSelected && (
                            <div className="server-details">
                                <label className="server-row">
                                    <span className="server-row-name">Channel</span>
                                    <select
                                        className="server-select"
                                        value={selection.channelId}
                                        onChange={(event) =>
                                            setChannel(server.id, event.target.value)
                                        }
                                    >
                                        <option value="" disabled>Select a channel</option>
                                        {server.channels.map((channel) => (
                                            <option key={channel.id} value={channel.id}>
                                                #{channel.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <fieldset className="server-roles">
                                    <legend>Roles to ping</legend>
                                    {server.roles.map((role) => (
                                        <label className="server-row" key={role.id}>
                                            <span className="server-row-name">@{role.name}</span>
                                            <input
                                                type="checkbox"
                                                className="server-checkbox"
                                                checked={selection.roleIds.includes(role.id)}
                                                onChange={() => toggleRole(server.id, role.id)}
                                            />
                                        </label>
                                    ))}
                                </fieldset>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}