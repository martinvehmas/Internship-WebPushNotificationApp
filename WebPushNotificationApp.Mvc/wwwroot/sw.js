﻿
const chatUrl = 'https://webpushchatapp-e7d5dac2fjdyfxaa.northeurope-01.azurewebsites.net/';
self.addEventListener('push', async function (event) {
    console.log('Push event received in service worker:');
    let data;

    try {
        // Attempt to parse the received data as JSON
        data = event.data.json();
    } catch (e) {
        // If parsing fails, treat it as plain text
        data = { title: 'Notification', message: event.data.text() };
    }

    const options = {
        body: data.message,
        icon: data.icon,
        badge: data.badge,
        vibrate: [200, 100, 200]
    };
    //retrieve browser tabs, or clients:
    const clientList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    });

    // Check if a client with the chat is already focused
    const isChatOpen = clientList.some(client => client.url.includes(chatUrl) && client.focused);

    // Only show notification if the chat tab is not open and focused
    if (!isChatOpen) {
        await self.registration.showNotification(data.title, options);
    }
});


self.addEventListener('notificationclick', (event) => {
    console.log('User clicked on notification.');
    event.notification.close(); // Close the notification

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then( (clientList) => {
            // Check if the app is already open in a tab
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url === chatUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new window or tab
            if (clients.openWindow) {
                return clients.openWindow(chatUrl);
            }
        })
    );
});
