import { useAnnouncer } from '../context/AnnouncerContext'

export default function ServerSelector() {
    const { servers, selections, toggleServer, setChannel, toggleRole } = useAnnouncer();

    return (
        <div>
            {servers.map((server) => {
                const selection = selections[server.id];
                const isSelected = selection !== undefined;

                return (
                    <div key={server.id}>
                        <label>
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleServer(server.id)}
                            />
                            {server.name}
                        </label>

                        {isSelected && (
                            <>
                                <select
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

                                <fieldset>
                                    <legend>Roles to ping</legend>
                                    {server.roles.map((role) => (
                                        <label key={role.id}>
                                            <input
                                                type="checkbox"
                                                checked={selection.roleIds.includes(role.id)}
                                                onChange={() => toggleRole(server.id, role.id)}
                                            />
                                            @{role.name}
                                        </label>
                                    ))}
                                </fieldset>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}