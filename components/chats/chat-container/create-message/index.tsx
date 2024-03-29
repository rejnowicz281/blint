"use client";

import generateBobUserMessage from "@/actions/bob-user/read/generate-bob-user-message";
import createAiMessages from "@/actions/chats/modify/create-ai-messages";
import createMessage from "@/actions/chats/modify/create-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAuthContext from "@/providers/auth-provider";
import useChatContext from "@/providers/chat-provider";
import useSettingsContext from "@/providers/settings-provider";
import clsx from "clsx";
import { useRef } from "react";
import PromptsContainer from "./prompts-container";

const CreateMessage = () => {
    const formRef = useRef<HTMLFormElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuthContext();
    const { addOptimisticMessage, recipient, expandPrompts, setExpandPrompts, talkingToBob, optimisticMessages } =
        useChatContext();
    const { promptsOn } = useSettingsContext();

    const beforeSend = () => {
        if (formRef.current) {
            const formData = new FormData(formRef.current);

            const text = formData.get("text");

            if (typeof text === "string" && text.trim().length > 0) setExpandPrompts(false);
        }
    };

    const handleSend = async (formData: FormData) => {
        const textFormData = formData.get("text");

        const text = typeof textFormData === "string" ? textFormData.trim() : null;

        if (text) {
            formRef.current?.reset();

            const message = addOptimisticMessage(text);

            if (!talkingToBob) {
                createMessage(formData);
                return;
            }

            const freshMessages = [...optimisticMessages, message];

            const bobMessage = await generateBobUserMessage(user, recipient.id, freshMessages);

            addOptimisticMessage(bobMessage.prompt, true, recipient);

            formData.append("ai_text", bobMessage.prompt);

            createAiMessages(formData); // create user message and AI response
        }
    };

    return (
        <div
            className={clsx(
                expandPrompts && promptsOn && "flex flex-col flex-1",
                "border-t border-t-neutral-300 dark:border-t-neutral-800"
            )}
        >
            {promptsOn && (
                <PromptsContainer
                    onPromptClick={(text: string) => {
                        if (inputRef.current) {
                            inputRef.current.focus();
                            inputRef.current.value = text;
                        }
                    }}
                />
            )}
            <div className="flex items-center justify-center">
                <form className="flex-1 flex items-center justify-center" ref={formRef} action={handleSend}>
                    <input type="hidden" name="sender_id" value={user.id} />
                    <input type="hidden" name="recipient_id" value={recipient.id} />

                    <Input
                        className="text-md py-8 rounded-none dark:bg-inherit border-none"
                        placeholder="Type your message here..."
                        type="text"
                        name="text"
                        ref={inputRef}
                    />
                    <Button
                        className="text-md py-8 rounded-none text-blue-500 hover:text-blue-500 dark:hover:text-blue-500 font-bold"
                        variant="ghost"
                        onClick={beforeSend}
                    >
                        SEND
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default CreateMessage;
