import { Expo, ExpoPushMessage } from "expo-server-sdk";

const expo = new Expo();

export const sendPushNotification = async (pushToken: string, title: string, body: string, data?: any) => {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    return;
  }

  const message: ExpoPushMessage = {
    to: pushToken,
    sound: "default",
    title,
    body,
    data,
  };

  try {
    const ticketChunk = await expo.sendPushNotificationsAsync([message]);
    console.log("Notification sent:", ticketChunk);
    return ticketChunk;
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

export const sendMultiplePushNotifications = async (messages: { pushToken: string, title: string, body: string, data?: any }[]) => {
  const expoMessages: ExpoPushMessage[] = messages
    .filter(m => Expo.isExpoPushToken(m.pushToken))
    .map(m => ({
      to: m.pushToken,
      sound: "default",
      title: m.title,
      body: m.body,
      data: m.data,
    }));

  if (expoMessages.length === 0) return [];

  const chunks = expo.chunkPushNotifications(expoMessages);
  const tickets = [];
  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error("Error sending notification chunk:", error);
    }
  }
  return tickets;
};
