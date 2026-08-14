import useHostSocket from '../../hook/useHostSocket';
import styles from './HostPage.module.css';

function HostPage() {
    const { action, quiz, isConnected, players } = useHostSocket();
    return (
        <div className={styles.container}>
            {isConnected ? (
                <>
                    <div className={styles.quiz}>
                        <div>Index: {quiz.index}</div>
                        <div className={styles.question}>
                            Q. {quiz.question}
                        </div>
                        <div>A. {quiz.answer}</div>
                        <div>Speed: {quiz.speed}</div>
                        <div className={styles.control}>
                            <button onClick={action.prev}>⏮️</button>
                            <button onClick={action.start}>▶️</button>
                            <button onClick={action.pause}>⏸️</button>
                            <button onClick={action.stop}>⏹️</button>
                            <button onClick={action.next}>⏭️</button>
                        </div>
                    </div>

                    <div className={styles.players}>
                        {players.map((player, index) => {
                            return (
                                <div key={index}>
                                    <div className={styles.name}>
                                        {player.name}
                                    </div>
                                    <div>{player.score}</div>
                                    <div>{player.state}</div>
                                    <div className={styles.buttons}>
                                        <button
                                            onClick={() =>
                                                action.mark(player.id, true)
                                            }>
                                            ⭕️
                                        </button>
                                        <button
                                            onClick={() =>
                                                action.mark(player.id, false)
                                            }>
                                            ✖️
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                // [TODO] Error processing
                <p>Connection error</p>
            )}
        </div>
    );
}

export default HostPage;
