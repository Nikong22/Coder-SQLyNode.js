const express = require("express");
const routes = require("./routes/productos")
const { engine } = require('express-handlebars');
const { SocketAddress } = require('net');
const productos = require("./models/productos");
const mensajes = require('./models/mensajes.js');
const fs = require('fs')
const { options } = require('./options/mariaDB');
const knex = require('knex')(options);
const { optionsSQL } = require('./options/SQLite3');
const knexSQL = require('knex')(optionsSQL);

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

knex.schema.createTableIfNotExists('productos', table => {
  table.increments('id'),
    table.string('title'),
    table.datetime('price'),
    table.string('thumbnail')
})

  .catch(e => {
    console.log('Error en proceso:', e);
    // knex.destroy();
  });
knex.from('productos').select('*')
  .then((productosDB) => {
    for (let producto of productosDB) {
      productos.push(producto)
    }
  })

// knexSQL.schema.dropTableIfExists('mensajes')
// .then(()=>console.log('Tabla borrada mensajes...'))
// .catch(e=>{
//     console.log('Error en drop:', e);
//     knexSQL.destroy();
//     process.exit(500);
// });

knexSQL.schema.createTableIfNotExists('mensajes', table => {
  table.string('autor'),
    table.string('texto'),
    table.datetime('fecha')
})
  .catch(e => {
    console.log('Error en proceso:', e);
    knexSQL.destroy();
  });
knexSQL.from('mensajes').select('*')
  .then((mensajesDB) => {
    for (let mensaje of mensajesDB) {
      mensajes.push(mensaje)
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

    knex('productos').insert([producto])
      .then((id_insertado) => {
        producto['id'] = id_insertado[0];
        productos.push(producto)
        io.sockets.emit('listar', productos);
      })
  })

  io.sockets.emit('mensajes', mensajes);

  socket.on('nuevo', (data) => {
    knexSQL('mensajes').insert([data])
    .then((id_insertado) => {
      mensajes['id'] = id_insertado[0];
      mensajes.push(data);

      knexSQL.from('mensajes').select('*')
        .then((mensajes) => {
          console.log(mensajes)
        })
      io.sockets.emit('mensajes', mensajes)
    })
  })
});