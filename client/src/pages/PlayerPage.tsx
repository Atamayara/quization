import { useRef } from 'react';
import usePlayerSocket from './../hook/usePlayerSocket';

function PlayerPage() {
    const { player, join, tapped, isConnected, isJoined } = usePlayerSocket();

    const nameInputRef = useRef<HTMLInputElement>(null);

    // The join button pushed
    function joinButton() {
        join(nameInputRef.current?.value);
    }

    return (
        <>
            {isConnected ? (
                isJoined ? (
                    // Play room (Connected and joined)
                    <>
                        <p>{player?.name ?? '-----'}</p>
                        <p>{player?.id ?? '-----'}</p>
                        <p>{player?.score ?? '-----'}</p>
                        <button
                            onClick={tapped}
                            style={{ width: '5rem', height: '5rem' }}>
                            Answer
                        </button>
                    </>
                ) : (
                    // Connecting menu (Connected and not joined)
                    <>
                        <input ref={nameInputRef} placeholder="name" />
                        <button onClick={joinButton}>Connect</button>
                    </>
                )
            ) : isJoined ? ( // [TODO] Error processing
                // Rejoining (Not connected and joined)
                <>
                    <p>Rejoining...</p>
                </>
            ) : (
                // Connection error (Not connected and not joined)
                <>
                    <p>Connection error</p>
                </>
            )}
        </>
    );
}

export default PlayerPage;
