import { PubSub } from "graphql-subscriptions";
import Message from "../../models/Message";

const pubsub = new PubSub(); //create a PubSub instance
/**
 *
 * @param {*} _root no usado
 * @param {*} param1 _
 * @param {*} context context info global
 * @param {*} info _
 * @returns
 */
let currentNumber = 0;
function incrementNumber() {
  currentNumber++;
  pubsub.publish("NUMBER_INCREMENTED", { numberIncremented: currentNumber });
  setTimeout(incrementNumber, 1000);
}
// Start incrementing
incrementNumber();
const Query = {
  Query: {
    currentNumber: async (parent, { to, content }, ctx) => {
      setTimeout(incrementNumber, 1000);
      pubsub.publish("NUMBER_INCREMENTED", {
        numberIncremented: currentNumber,
      });
      return 1;
    },
    getMessages: async (parent, { codeRoom, id }, ctx) => {
      try {
        const messages = await Message.findAll({
          where: {
            codeRoom,
            from: id,
          },
        });

        return messages;
      } catch (error) {
        throw new Error(`Error fetching messages: ${error.message}`);
      }
    },
  },
};

const sendMessage = async (
  parent,
  { from, content, to, codeRoom },
  { models, pubsub }
) => {
  try {
    const message = await Message.create({
      content,
      from,
      codeRoom,
      to,
    });

    // Publica el evento de nuevo mensaje usando pubsub
    pubsub.publish("NEW_MESSAGE", { newMessage: message });

    // Publica el evento de nuevo mensaje en una sala de chat específica
    pubsub.publish(`NEW_CHAT_ROOM_MESSAGE_${codeRoom}`, {
      newChatRoomMessage: message,
    });

    return message;
  } catch (error) {
    throw new Error(`Error al enviar el mensaje: ${error.message}`);
  }
};

const SubscriptionSubscription = {
  Subscription: {
    numberIncremented: {
      subscribe: () => pubsub.asyncIterator(["NUMBER_INCREMENTED"]),
    },
    newMessage: {
      subscribe: (parent, args, { pubsub }) => {
        console.log("🚀 ~ args:", args);
        // Suscríbete a eventos de nuevos mensajes en general
        return pubsub.asyncIterator("NEW_MESSAGE");
      },
    },
    newChatRoomMessage: {
      subscribe: (parent, { codeRoom, ...rest }, { pubsub }) => {
        console.log({ parent, rest, codeRoom });
        // Suscríbete a eventos de nuevos mensajes en una sala de chat específica
        return pubsub.asyncIterator(`NEW_CHAT_ROOM_MESSAGE_${codeRoom}`);
      },
    },
  },
};

export default {
  TYPES: {},
  QUERIES: {
    ...Query.Query,
  },
  MUTATIONS: {
    sendMessage,
  },
  SUBSCRIPTIONS: {
    ...SubscriptionSubscription.Subscription,
  },
};
