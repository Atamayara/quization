import useHostSocket from '../../hook/useHostSocket';
import styles from './HostPage.module.css';

function HostPage() {
    const { actions, settings, quiz, isConnected, players } = useHostSocket();

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
                        <div>
                            Speed:{' '}
                            <input
                                type="number"
                                value={quiz.speed ?? ''}
                                onChange={(e) =>
                                    settings.changeSpeed(
                                        parseFloat(e.currentTarget.value),
                                    )
                                }
                            />
                        </div>
                        <div>
                            Rest:{' '}
                            <input
                                type="number"
                                value={quiz.rest ?? ''}
                                onChange={(e) =>
                                    settings.changeRest(
                                        parseInt(e.currentTarget.value),
                                    )
                                }
                            />
                        </div>
                        <div>
                            Point:
                            <div>
                                ⭕️
                                <input
                                    type="number"
                                    value={quiz.correct ?? ''}
                                    onChange={(e) =>
                                        settings.changeCorrectPoint(
                                            parseFloat(e.currentTarget.value),
                                        )
                                    }
                                />
                            </div>
                            <div>
                                ✖️
                                <input
                                    type="number"
                                    value={quiz.incorrect ?? ''}
                                    onChange={(e) =>
                                        settings.changeIncorrectPoint(
                                            parseFloat(e.currentTarget.value),
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <div className={styles.control}>
                            <button onClick={actions.prev}>⏮️</button>
                            <button onClick={actions.start}>▶️</button>
                            <button onClick={actions.pause}>⏸️</button>
                            <button onClick={actions.stop}>⏹️</button>
                            <button onClick={actions.next}>⏭️</button>
                            <button onClick={actions.reset}>🔄</button>
                        </div>
                        <div>
                            Sound: <a href="https://otologic.jp/">OtoLogic</a>
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
                                    <div>
                                        {!player.isOnline
                                            ? 'OFFLINE'
                                            : player.state === 'REST'
                                              ? `REST ${player.restCount}`
                                              : player.tappedAt !== null
                                                ? (
                                                      player.tappedAt / 1000
                                                  ).toFixed(2)
                                                : player.state}
                                    </div>
                                    <div>
                                        {player.correct}⭕️ {player.incorrect}✖️
                                    </div>
                                    <div className={styles.buttons}>
                                        <button
                                            onClick={() =>
                                                actions.mark(player.id, true)
                                            }>
                                            ⭕️
                                        </button>
                                        <button
                                            onClick={() =>
                                                actions.mark(player.id, false)
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
                <p>Connection error</p>
            )}
        </div>
    );
}

export default HostPage;
