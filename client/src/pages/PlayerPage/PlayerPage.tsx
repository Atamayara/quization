import { useRef } from 'react';
import usePlayerSocket from '../../hook/usePlayerSocket';
import styles from './PlayerPage.module.css';

function PlayerPage() {
    const { player, join, tapped, isConnected, isJoined } = usePlayerSocket();

    const nameInputRef = useRef<HTMLInputElement>(null);

    // The join button pushed
    function joinButton() {
        join(nameInputRef.current?.value);
    }

    return (
        <div className={styles.container}>
            {isConnected ? (
                isJoined ? (
                    // Play room (Connected and joined)
                    <>
                        <p>Name: {player?.name ?? '-----'}</p>
                        <p>Score: {player?.score ?? '-----'}</p>
                        <button onMouseDown={tapped} className={styles.button}>
                            <div className={styles.top}></div>
                            <div className={styles.body}></div>
                            <div className={styles.bottom}></div>
                            <div className={styles.baseTop}></div>
                            <div className={styles.baseBody}></div>
                            <div className={styles.baseBottom}></div>
                        </button>
                    </>
                ) : (
                    // Connecting menu (Connected but not joined)
                    <>
                        <input ref={nameInputRef} placeholder="name" />
                        <button onClick={joinButton}>Connect</button>
                    </>
                )
            ) : isJoined ? ( // [TODO] Error processing
                // Reload required (Not connected but joined)
                <>
                    <p>Please reload to rejoin</p>
                </>
            ) : (
                // Connection error (Not connected and not joined)
                <>
                    <p>Connection error</p>
                </>
            )}
        </div>
    );
}

export default PlayerPage;
