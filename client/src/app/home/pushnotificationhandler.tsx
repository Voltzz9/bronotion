'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react'

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function PushNotificationHandler() {
    const { data: session } = useSession();
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            const handleServiceWorker = async () => {
                const register = await navigator.serviceWorker.register("/sw.js");
                const subscription = await register.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY || "BG-iCoGsGvQ4B6R5GL--aerOPJHKj-EyFkEZjgP2w-HIvhjqMEVo4W-oGTt7_Ok1YuH_tegUtiahMkUzuVMT6xk"),

                });
                if (session?.user?.id) {
                    const id = session.user.id;
                    await fetch("https://localhost:8080/subscribe", {
                        method: "POST",
                        body: JSON.stringify({
                            subscription: subscription,
                            id: id
                        }),
                        headers: {
                            "content-type": "application/json",
                        },
                    });

                } else {
                    return
                }

            };
            handleServiceWorker();
        }
    }, [session?.user?.id]);
    return null;
}