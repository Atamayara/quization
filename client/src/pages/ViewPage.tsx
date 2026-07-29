import { useRef, useState } from 'react';
import useViewSocket from './../hook/useViewSocket';
import QuestionText, {
    type QuestionTextHandle,
} from './../components/QuestionText';

function HostPage() {
    const { quiz, isConnected, players } = useViewSocket({
        start: start,
        pause: pause,
        stop: stop,
        correct: correct,
        incorrect: incorrect,
    });

    const questionTextHandleRef = useRef<QuestionTextHandle | null>(null);

    const [isReading, setIsReading] = useState<boolean>(false);

    // Start reading
    function start() {
        setIsReading(true);
    }

    // Pause reading
    function pause() {
        setIsReading(false);
    }

    // Stop reading
    function stop() {
        questionTextHandleRef.current?.showAll();
    }

    // [TODO] Styling
    const [temp, setTemp] = useState<string>('');
    // Mark as correct
    function correct() {
        setTemp(temp + 'o');
    }

    // Mark as incorrect
    function incorrect() {
        setTemp(temp + 'x');
    }

    return (
        // [TODO] Styling
        <>
            {isConnected ? (
                <>
                    <p>{quiz.index}</p>
                    <QuestionText
                        ref={questionTextHandleRef}
                        text={quiz.question ?? ''}
                        speed={quiz.speed ?? 5}
                        isReading={isReading}
                    />
                    <p>{quiz.answer}</p>
                    <p>{temp}</p>
                    <div>
                        {players.map((player) => {
                            return (
                                <div>
                                    <p>{player.name}</p>
                                    <p>{player.score}</p>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                // [TODO] Error processing
                <p>Connection error</p>
            )}
        </>
    );
}

export default HostPage;
