const express = require("express");
// const productos = require("../productos.js");
const routes_controller = require('./controllers/productos.controller');

const { Router } = express;

let router = new Router();

router.get("/", (req, res) => {
  res.sendFile("/public/index.html")
});

router.get('/productos', function (req, res) {
  let tieneDatos;
  const productos = routes_controller.getProductos()
  if (productos.length > 0) {
    tieneDatos = true
  } else {
    tieneDatos = false
  }
  res.render('main', { productos: productos, listExists: tieneDatos });
});

router.get("/productos/:id", (req, res) => {
  const producto = routes_controller.getProducto(req, res) //acá buscás el producto como estás haciendo ahora
  let tieneDatos;// hacés lo mismo que estás haciendo en /productos con este if-else para esta variable
  if (producto) {
    tieneDatos = true
  }else{
    tieneDatos = false
  }
  const productos = []//ese main (2 líneas más abajo) recibe un array de productos y la variable anterior, entonces en vez de pasar un objeto producto, tenés que pasar un array
  productos.push(producto);//por eso creás el array vacío y le hacés un push del producto encontrado
  res.render('main', { productos: productos, listExists: tieneDatos });//acá ahora se pasa un array de 1 producto (o null) y la variable tieneDatos que dice si tiene algo o no
});

router.post("/productos", function (req, res) {
  routes_controller.nuevoProducto(req);
  res.redirect("../../../");
});

router.put("/productos/:id", (req, res) => {
  routes_controller.actualizarProducto(req);
  res.send("Producto Actualizado");
});

router.delete("/productos/:id", (req, res) => {
  routes_controller.borrarProducto(req);
  res.send("Producto Borrado");
});

module.exports = router;