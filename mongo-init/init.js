// Este script se ejecuta automáticamente cuando se crea el contenedor por primera vez
// La variable 'db' apunta a la base de datos especificada en MONGO_INITDB_DATABASE

// Crear colecciones iniciales
db.createCollection("usuarios");
db.createCollection("productos");

// Insertar datos iniciales
db.usuarios.insertMany([
  {
    nombre: "Juan Pérez",
    email: "juan@ejemplo.com",
    fechaCreacion: new Date()
  },
  {
    nombre: "María González",
    email: "maria@ejemplo.com",
    fechaCreacion: new Date()
  }
]);

db.productos.insertMany([
  {
    nombre: "Producto 1",
    precio: 100,
    categoria: "electrónicos",
    stock: 50
  },
  {
    nombre: "Producto 2",
    precio: 200,
    categoria: "hogar",
    stock: 25
  }
]);

// Crear índices
db.usuarios.createIndex({ email: 1 }, { unique: true });
db.productos.createIndex({ categoria: 1 });

print("Base de datos inicializada correctamente");