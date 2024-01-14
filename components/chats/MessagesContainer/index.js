"use client";

import { assignTimestamp } from "@/utils/general/generateTimestamps";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useTransition } from "react";
import CreateMessage from "./CreateMessage";
import MessagesList from "./MessagesList";
import RecipientInfo from "./RecipientInfo";
import css from "./index.module.css";

export default function MessagesContainer({ messages, recipient }) {
    const [isPending, startTransition] = useTransition();
    const [optimisticMessages, setOptimisticMessages] = useOptimistic(messages);

    const router = useRouter();
    const supabase = createClientComponentClient();

    useEffect(() => {
        const messagesChannel = supabase
            .channel("messages")
            .on(
                "postgres_changes",
                {
                    schema: "public",
                    event: "*",
                    table: "messages",
                    filter: `sender_id=eq.${recipient.id}`,
                },
                (payload) => {
                    console.log("Change received", payload.new);
                    router.refresh();
                }
            )
            .subscribe();

        console.log("Connected to messages channel", messagesChannel.topic);

        return () => {
            supabase.removeChannel(messagesChannel);
        };
    }, [supabase, router]);

    useEffect(() => {
        startTransition(() => {
            setOptimisticMessages(messages); // Ensure messages update
        });
    }, [messages]);

    function addOptimisticMessage(message) {
        setOptimisticMessages((messages) => {
            const lastMessage = messages[messages.length - 1];
            assignTimestamp(message, lastMessage);

            return [...messages, message];
        });
    }

    function deleteOptimisticMessage(id) {
        setOptimisticMessages((messages) => {
            const messageIndex = messages.findIndex((message) => message.id === id);
            assignTimestamp(messages[messageIndex + 1], messages[messageIndex - 1]);

            return messages.filter((message) => message.id !== id);
        });
    }

    return (
        <div className={css.wrapper}>
            <div className={css.container}>
                <RecipientInfo recipient={recipient} />

                <MessagesList messages={optimisticMessages} deleteOptimisticMessage={deleteOptimisticMessage} />

                <CreateMessage recipient={recipient} messages={messages} addOptimisticMessage={addOptimisticMessage} />
            </div>
        </div>
    );
}
