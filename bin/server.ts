/*
|---------------------------------    // Configurar WebSocket y MongoDB Change Streams después de que la aplicación esté lista
    app.ready(async () => {
      const WebSocketService = await import('../app/services/websocket_service.js')
      const MongoChangeStreamService = await import('../app/services/mongo_change_stream_service.js')
      
      const httpServer = await app.container.make('server')
      const nodeServer = httpServer.getNodeServer()
      
      if (nodeServer) {
        // Inicializar WebSocket
        WebSocketService.default.initialize(nodeServer)
        console.log('🚀 WebSocket server initialized')
        
        // Inicializar MongoDB Change Streams
        await MongoChangeStreamService.default.getInstance().initialize()
        console.log('🔄 MongoDB Change Streams initialized')
      }
    })-------------------------------
| HTTP server entrypoint
|--------------------------------------------------------------------------
|
| The "server.ts" file is the entrypoint for starting the AdonisJS HTTP
| server. Either you can run this file directly or use the "serve"
| command to run this file and monitor file changes
|
*/

import 'reflect-metadata'
import { Ignitor, prettyPrintError } from '@adonisjs/core'

/**
 * URL to the application root. AdonisJS need it to resolve
 * paths to file and directories for scaffolding commands
 */
const APP_ROOT = new URL('../', import.meta.url)

/**
 * The importer is used to import files in context of the
 * application.
 */
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

new Ignitor(APP_ROOT, { importer: IMPORTER })
  .tap((app) => {
    app.booting(async () => {
      await import('#start/env')
    })
    
    // Configurar WebSocket después de que la aplicación esté lista
    app.ready(async () => {
      const WebSocketService = await import('../app/services/websocket_service.js')
      const MongoChangeStreamService = await import('../app/services/mongo_change_stream_service.js')
      
      const httpServer = await app.container.make('server')
      const nodeServer = httpServer.getNodeServer()
      
      if (nodeServer) {
        // Inicializar WebSocket
        WebSocketService.default.initialize(nodeServer)
        console.log('🚀 WebSocket server initialized')
        
        // Inicializar MongoDB Change Streams
        await MongoChangeStreamService.default.getInstance().initialize()
        console.log('🔄 MongoDB Change Streams initialized')
      }
    })
    
    // Configurar limpieza de recursos al cerrar la aplicación
    app.terminating(async () => {
      console.log('🔄 Cerrando servicios...')
      const MongoChangeStreamService = await import('../app/services/mongo_change_stream_service.js')
      await MongoChangeStreamService.default.getInstance().close()
      console.log('✅ Servicios cerrados correctamente')
    })
    
    app.listen('SIGTERM', () => app.terminate())
    app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
  })
  .httpServer()
  .start()
  .catch((error) => {
    process.exitCode = 1
    prettyPrintError(error)
  })
