function memberExists(host) {
  const status = rs.status();
  return status.members.some(m => m.name === host);
}

try {
  rs.status();
  print("Replica Set ya inicializado.");

  // Define el nuevo nodo que quieres agregar
  const newMember = "18.217.230.121:27018";

  if (!memberExists(newMember)) {
    print("Agregando nuevo miembro:", newMember);
    rs.add(newMember);
  } else {
    print("Miembro ya existe:", newMember);
  }

} catch (e) {
  print("Replica Set no inicializado, iniciando...");
  rs.initiate({
    _id: "rs0",
    members: [
      { _id: 0, host: "www.atenasoficial.com:27100" }
    ]
  });
}
