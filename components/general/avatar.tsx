"use client";

import usePresenceContext from "@/providers/presence-provider";
import Image from "next/image";
import { FC } from "react";

type AvatarProps = {
    userId: string;
    aiMode?: boolean;
    src: string;
    alt?: string;
    avatarSize?: number;
    markerSize?: number;
};

const Avatar: FC<AvatarProps> = ({ userId, aiMode, src, alt, avatarSize = 60, markerSize = 15 }) => {
    const { loggedUsers } = usePresenceContext();

    const isLogged = loggedUsers.includes(userId);

    return (
        <div
            className="relative shrink-0"
            style={{
                width: avatarSize,
                height: avatarSize,
            }}
        >
            <Image sizes="150px" fill className="rounded-[50%]" src={src} alt={alt || `User ${userId}`} />
            {isLogged && (
                <div
                    className="absolute bottom-0 right-0 border-[1px] border-solid border-black rounded-[50%] bg-green-400"
                    style={{ width: markerSize, height: markerSize }}
                />
            )}
            {aiMode && (
                <div
                    className="absolute top-0 right-0 border-[1px] border-solid border-black rounded-[50%] bg-blue-500"
                    style={{ width: markerSize, height: markerSize }}
                />
            )}
        </div>
    );
};

export default Avatar;
