const express = require("express");
const routes = require("./routes/productos")
const { engine } = require('express-handlebars');
const { SocketAddress } = require('net');
const productos = require("./models/productos");
const mensajes = require('./models/mensajes.js');
const fs = require('fs')
const {options} = require('./options/mariaDB');
const knex = require('knex')(options);

const app = express();
const PORT = 8080;
const http = require("http").Server(app);
const io = require('socket.io')(http);

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", routes)

app.set('views', './views'); // especifica el directorio de vistas
app.set('view engine', 'hbs'); // registra el motor de plantillas

app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "index.hbs",
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials"
  })
);

let server;
server = http.listen(PORT, () =>
  console.log(`Servidor HTTP escuando en el puerto ${PORT}`)
);

// knex.schema.dropTableIfExists('productos')
// .then(()=>console.log('Tabla borrada...'))
// .catch(e=>{
//     console.log('Error en drop:', e);
//     knex.destroy();
//     process.exit(500);
// });

knex.schema.createTable('productos', table => {
  table.increments('id'),
  table.string('title'),
  table.float('price'),
  table.string('thumbnail')
})

.catch(e=>{
    console.log('Error en proceso:', e);
    // knex.destroy();
});
knex.from('productos').select('*')
    .then((productosDB)=>{
      for (let producto of productosDB) {
          productos.push(producto)
      }
})

io.on('connection', (socket) => {
  console.log('alguien se está conectado...');

  io.sockets.emit('listar', productos);

  socket.on('notificacion', (title, price, thumbnail) => {
    const producto = {
      id: funciones.getSiguienteId(productos),
      title: title,
      price: price,
      thumbnail: thumbnail,
    };
    producto.push(productos);

    io.sockets.emit('listar', productos);
  })

  io.sockets.emit('mensajes', mensajes);

  socket.on('nuevo', (data) => {
    mensajes.push(data);
    fs.writeFileSync('./mensaje.txt', JSON.stringify(mensajes));
    io.sockets.emit('mensajes', mensajes)
  })

});