import express from 'express';

import productsRouter from './routes/products-router.js';
import cartsRouter from './routes/cart-router.js';
import productsViews from './routes/views-router.js';
import messageRouter from './routes/messages-router.js';

import handlebars from 'express-handlebars';
import {Server} from 'socket.io';
import __dirname from './utils.js';

import mongoose from 'mongoose';
import DBMessageManager from './DAO/mongoDB/messageManager.js';

const app=express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

app.use('/api/products', productsRouter );
app.use('/api/carts', cartsRouter );
app.use('/', productsViews);
app.use('/messages', messageRouter);

const httpServer=app.listen(8080, ()=> console.log("Servidor activo en el puerto 8080"));
const io= new Server(httpServer);

const url="mongodb+srv://nachodamonte:av8UsYfzZ7beECGs@clusternacho.19jchdd.mongodb.net/";

mongoose.connect(url, {dbName:"segunda_preentrega"});

const messages= new DBMessageManager();

io.on('connection', async socket =>{

    console.log("Nuevo usuario conectado");

    const messageHistory= await messages.sendMessages();

    socket.on('message', async data => {
        const newMessage= await messages.addMessage(data);
        messageHistory.push(data);

        io.emit('messagesLogs', messageHistory);
    });

    socket.on('userConnect', data => {
        socket.emit('messagesLogs', messageHistory)
    })
});

export {io}