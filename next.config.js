const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    reloadOnOnline: true,
    swcMinify: true,
    // disable: process.env.NODE_ENV === "development",
    workboxOptions: {
        disableDevLogs: true,
    },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "scrruahnokbhqgaymfvx.supabase.co",
            },
            {
                protocol: "https",
                hostname: "avatars.githubusercontent.com",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
        ],
    },
};

module.exports = withPWA(nextConfig);
