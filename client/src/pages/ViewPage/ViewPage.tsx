import { useRef, useState } from 'react';
import useViewSocket from '../../hook/useViewSocket';
import QuestionText, {
    type QuestionTextHandle,
} from '../../components/QuestionText';
import AnswerText, { type AnswerTextHandle } from '../../components/AnswerText';

function HostPage() {
    const { quiz, isConnected, players } = useViewSocket({
        start: start,
        pause: pause,
        stop: stop,
        correct: correct,
        incorrect: incorrect,
    });

    const questionTextHandleRef = useRef<QuestionTextHandle | null>(null);
    const answerTextHandleRef = useRef<AnswerTextHandle | null>(null);

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
        answerTextHandleRef.current?.show();
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
                        className=""
                        text={quiz.question ?? ''}
                        speed={quiz.speed ?? 5}
                        isReading={isReading}
                    />
                    <AnswerText
                        key={quiz.index}
                        ref={answerTextHandleRef}
                        className=""
                        answer={quiz.answer ?? ''}
                    />
                    <p>{temp}</p>
                    <div>
                        {players.map((player, index) => {
                            return (
                                <div key={index}>
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
