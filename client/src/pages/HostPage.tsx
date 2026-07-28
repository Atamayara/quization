import useHostSocket from './../hook/useHostSocket';

function HostPage() {
    const { action, quiz, isConnected, players } = useHostSocket();
    return (
        // [TODO] Styling
        <>
            {isConnected ? (
                <>
                    <p>{quiz.index}</p>
                    <p>{quiz.question}</p>
                    <p>{quiz.answer}</p>
                    <p>{quiz.speed}</p>
                    <button onClick={action.prev}>⏮️</button>
                    <button onClick={action.start}>▶️</button>
                    <button onClick={action.pause}>⏸️</button>
                    <button onClick={action.stop}>⏹️</button>
                    <button onClick={action.next}>⏭️</button>
                    <div>
                        {players.map((player) => {
                            return (
                                <div>
                                    <p>{player.name}</p>
                                    <p>{player.score}</p>
                                    <button
                                        onClick={() =>
                                            action.mark(player.id, true)
                                        }>
                                        o
                                    </button>
                                    <button
                                        onClick={() =>
                                            action.mark(player.id, false)
                                        }>
                                        x
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                // [TODO] Error processing
                <p>接続エラー</p>
            )}
        </>
    );
}

export default HostPage;
