import { PubSub, withFilter } from "graphql-subscriptions";
const pubsub = new PubSub(); // Create a PubSub instance

export const setALogoStore = async (_root, { logo, idStore }, ctx) => {
  try {
    // Validate input data
    if (!logo || !idStore) {
      throw new Error("Missing required parameters: logo and idStore");
    }

    const fileUpload = await logo;
    const { createReadStream, filename, mimetype } = fileUpload;
    // saveImages()
    const fileStream = createReadStream();
    return {
      success: true,
      message: "Logo subido con éxito",
    };
  } catch (error) {
    console.error("Error al subir el logo:", error);
    return {
      success: false,
      message: "Lo sentimos, ha ocurrido un error. Por favor, vuelve a intentarlo.",
    };
  }
};

const NEW_STORE_ORDER = "NEW_STORE_ORDER";

export const pushNotificationOrder = async (
  _root,
  { pCodeRef, idStore },
  ctx
) => {
  try {
    // Validate input data
    if (!pCodeRef || !idStore) {
      throw new Error("Missing required parameters: pCodeRef and idStore");
    }

    // Query to obtain the order
    const order = {
      pdpId: "sample-pdpId",
      id: "sample-id",
      idStore: idStore,
      pId: "sample-pId",
      ppState: "sample-ppState",
      pCodeRef: pCodeRef,
      pPDate: "sample-pPDate",
      pSState: "sample-pSState",
      pPStateP: "sample-pPStateP",
      payMethodPState: "sample-payMethodPState",
      pPRecoger: false,
      totalProductsPrice: 13423,
      unidProducts: 13423,
      pDatCre: "sample-pDatCre",
      pDatMod: "sample-pDatMod",
    };

    // Publish the new store order event
    pubsub.publish(`${NEW_STORE_ORDER}_${idStore}`, {
      newStoreOrder: order,
      ctx,
    });
    
    return order;
  } catch (error) {
    console.error("Error al publicar la nueva orden de tienda:", error);
    throw new Error("Error al publicar la nueva orden de tienda. Por favor, vuelve a intentarlo.");
  }
};

const resolvers = {
  Subscription: {
    newStoreOrder: {
      subscribe: withFilter(
        (_, { idStore }) => {
          return pubsub.asyncIterator(`${NEW_STORE_ORDER}_${idStore}`);
        },
        (payload, variables) => {
          // Verify if the idStore from the payload matches the idStore from the filter
          return payload.newStoreOrder.idStore === variables.idStore;
        }
      ),
    },
  },
};

export default {
  TYPES: {},
  QUERIES: {
  },
  MUTATIONS: {
    pushNotificationOrder,
    setALogoStore
  },
  SUBSCRIPTIONS: {
    ...resolvers.Subscription,
  },
};
