const productos = require("../../models/productos");
const {options} = require('../../options/mariaDB');
const knex = require('knex')(options);

class Funciones {
  getSiguienteId = (productos) => {
    let ultimoId = 0;
    productos.forEach((producto) => {
      if (producto.id > ultimoId) {
        ultimoId = producto.id;
      }
    });
    return ++ultimoId;
  };
  inicializar = (productos) => {
    let id = 1
    productos.forEach((producto) => {
      if (!producto.id) {
        producto.id = id++
      }
    });
  }
}
const funciones = new Funciones();
funciones.inicializar(productos)

const getProductos = (req, res) => {
  return productos
}

const getProducto = (req, res) => {
  const { id } = req.params;
  knex.from('productos').select('*')
      .then((productos)=>{
        console.log(productos)
        res.json(productos);
    })
  return productos.find((producto) => producto.id == id);
}

const nuevoProducto = (req, res) => {
  let { title, price, thumbnail } = req.body;
  let productoNuevo = {
    id: funciones.getSiguienteId(productos),
    title,
    price,
    thumbnail,
  };
  knex('productos').insert(productoNuevo)
  .then( function (result) {
    console.log(result)
  })
  productos.push(productoNuevo);
}

const actualizarProducto = (req, res) => {
  const { id } = req.params;
  let { title, price, thumbnail } = req.body;
  let producto = productos.find((producto) => producto.id == id);
  if (!producto) {
    return res.status(404).json({ msg: "Producto no encontrado" });
  }
  (producto.title = title), (producto.price = price), (producto.thumbnail = thumbnail)
  knex.from('productos').where('id', '=', id).update(({price: price, title: title, thumbnail: thumbnail}))
  .then(()=>{
    console.log('producto actualizado')
})
}

const borrarProducto = (req, res) => {
  const { id } = req.params;

  let producto = productos.find((producto) => producto.id == id);
  if (!producto) {
    return res.status(404).json({ msg: "Producto no encontrado" });
  }
  const index = productos.findIndex((producto) => producto.id == id);
  productos.splice(index, 1);
  knex.from('productos').where('id', '=', id).del()
  .then(()=>{
    console.log('producto borrado')
})
}

module.exports = { getProductos, getProducto, nuevoProducto, actualizarProducto, borrarProducto }