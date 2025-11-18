const whitelist = ["localhost", "firefly-pokeman-sec.vercel.app"];

const getOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigin = !origin || whitelist.some((value) => origin.includes(value));
    if (allowedOrigin) {
        callback(null, true);
    } else {
        callback(new Error("Not allowed by CORS"));
    }
};

export const corsOptions = { origin: getOrigin };