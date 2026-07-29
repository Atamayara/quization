import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

type QuestionTextArgs = {
    text: string;
    speed: number;
    isReading: boolean;
    className?: string;
};

export type QuestionTextHandle = {
    showAll: () => void;
};

// Display text of a question character by character
const QuestionText = forwardRef<QuestionTextHandle, QuestionTextArgs>(
    ({ text, speed, isReading, className }, ref) => {
        const textBoxRef = useRef<HTMLParagraphElement | null>(null);
        const indexRef = useRef<number>(0);
        const timerId = useRef<number | null>(null);

        function completeText() {
            if (timerId.current) {
                clearInterval(timerId.current);
                timerId.current = null;
            }
            if (textBoxRef.current) {
                textBoxRef.current.textContent = text;
            }
        }

        useImperativeHandle(ref, () => ({
            showAll: completeText,
        }));

        useEffect(() => {
            indexRef.current = 0;
            if (textBoxRef.current) {
                textBoxRef.current.textContent = '';
            }

            if (timerId.current) {
                clearInterval(timerId.current);
                timerId.current = null;
            }

            if (!isReading) return;

            const step = () => {
                if (textBoxRef.current) {
                    textBoxRef.current.textContent = text.slice(
                        0,
                        ++indexRef.current,
                    );
                }

                if (indexRef.current >= text.length && timerId.current) {
                    clearInterval(timerId.current);
                    timerId.current = null;
                }
            };

            step();
            const intervalMs = 1000 / speed;
            timerId.current = window.setInterval(step, intervalMs);

            return () => {
                if (timerId.current) {
                    clearInterval(timerId.current);
                    timerId.current = null;
                }
            };
        }, [text, isReading, speed]);

        return <p className={className} ref={textBoxRef}></p>;
    },
);

QuestionText.displayName = 'QuestionText';

export default QuestionText;
