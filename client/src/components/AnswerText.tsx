import { forwardRef, useImperativeHandle, useState } from 'react';

type AnswerTextArgs = {
    className?: string;
    answer: string;
};

export type AnswerTextHandle = {
    show: () => void;
};

// Display the answer text
const AnswerText = forwardRef<AnswerTextHandle, AnswerTextArgs>(
    ({ answer, className }, ref) => {
        const [visibility, setVisibility] = useState<boolean>(false);

        useImperativeHandle(ref, () => ({
            show: () => setVisibility(true),
        }));

        return <>{visibility && <p className={className}>{answer}</p>}</>;
    },
);

AnswerText.displayName = 'QuestionText';

export default AnswerText;
