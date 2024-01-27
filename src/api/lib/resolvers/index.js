// import GraphQLUpload from 'graphql-upload'
import dateTimeScalar from './CustomScalar'
import deviceResolver from './device'
import messagesResolver from './messages'
import storeResolver from './stores'
import { GraphQLUpload } from "graphql-upload";
export default {
    ...deviceResolver.TYPES,
    DateTime: dateTimeScalar,
    Upload: GraphQLUpload,
    Query: {
        ...deviceResolver.QUERIES,
        ...storeResolver.QUERIES,
        ...messagesResolver.QUERIES,
    },
    Mutation: {
        ...deviceResolver.MUTATIONS,
        ...messagesResolver.MUTATIONS,
        ...storeResolver.MUTATIONS,
    },
    Subscription: {
        ...messagesResolver.SUBSCRIPTIONS,
        ...storeResolver.SUBSCRIPTIONS,
        // ...deviceResolver.SUBSCRIPTIONS,
    },
}
