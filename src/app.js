// @ts-check
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { ApolloServer, gql } from 'apollo-server-express';
import { PubSub } from 'graphql-subscriptions';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphqlUploadExpress } from 'graphql-upload';
import express from 'express';
import morgan from 'morgan';
import net from 'net'; // Importamos la librería net para manejar conexiones TCP
// @ts-ignore
import typeDefs from './api/lib/typeDefs';
import resolvers from './api/lib/resolvers';

(async () => {
    // Configuración de puertos
    const GRAPHQL_PORT = 8080;
    const TCP_PORT = 9090; // Puerto para conexiones TCP
    const pubsub = new PubSub();

    // Inicialización de la app de Express
    const app = express();

    // Middleware
    app.use(morgan('dev'));
    app.use(express.json({ limit: '50mb' }));
    app.use(graphqlUploadExpress({ maxFileSize: 1000000000, maxFiles: 10 }));

    const httpServer = createServer(app);
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const server = new ApolloServer({
        typeDefs, 
        resolvers,
        introspection: true,
        plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
        context: ({ req, res, connection }) => {
            if (connection) {
                const { restaurant } = connection.context || {};
                return { pubsub, restaurant };
            } else {
                const token = req.headers.authorization;
                if (token !== 'null') {
                    try {
                        // validate user in client.
                        // const User = await jwt.verify(token, process.env.AUTHO_USER_KEY);
                        const User = null;
                        return { User, res, pubsub };
                    } catch (err) {
                        console.log(err);
                        console.log('Hola esto es un error del contexto');
                    }
                }
                return { pubsub };
            }
        },
    });

    await server.start();
    server.applyMiddleware({ app });

    // Configuración del servidor WebSocket para suscripciones
    SubscriptionServer.create(
        {
            schema,
            execute,
            subscribe,
            onConnect: (connectionParams, webSocket, context) => {
                console.log(connectionParams);
                if (connectionParams?.headers?.restaurant || connectionParams?.restaurant) {
                    const restaurant = connectionParams?.headers?.restaurant ?? connectionParams.restaurant;
                    console.log("connection", restaurant);
                    return { pubsub, restaurant };
                }
                throw new Error("Restaurant not provided in connection params");
            },
        },
        {
            server: httpServer,
            path: server.graphqlPath,
        }
    );

    // Configuración del servidor TCP
    const tcpServer = net.createServer((socket) => {
        console.log('New TCP connection established.');

        // Cuando recibes datos desde el cliente TCP
        socket.on('data', (data) => {
            console.log(`Received TCP data: ${data.toString()}`);
            // Aquí puedes procesar los datos recibidos y devolver una respuesta si es necesario
            socket.write('Data received over TCP\n');
        });

        // Manejar el cierre de la conexión
        socket.on('end', () => {
            console.log('TCP connection closed.');
        });

        // Manejar errores
        socket.on('error', (err) => {
            console.error('TCP connection error:', err);
        });
    });

    // Escuchar en el puerto TCP especificado
    tcpServer.listen(TCP_PORT, () => {
        console.log(`🚀 TCP server ready at tcp://localhost:${TCP_PORT}`);
    });

    // Iniciar el servidor HTTP y WebSocket
    httpServer.listen(GRAPHQL_PORT, () => {
        console.log(
            `🚀 Query endpoint ready at http://localhost:${GRAPHQL_PORT}${server.graphqlPath}`
        );
        console.log(
            `🚀 Subscription endpoint ready at ws://localhost:${GRAPHQL_PORT}${server.graphqlPath}`
        );
    });
})();
