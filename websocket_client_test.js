/**
 * Cliente WebSocket de prueba en consola
 * Para probar las notificaciones en tiempo real
 */

import { io } from 'socket.io-client'

// Configuración
const SERVER_URL = 'http://192.168.114.57:3333'
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
}

let messageCount = 0
let sensorReadingCount = 0
let databaseChangeCount = 0
let startTime = Date.now()

function log(message, color = 'reset') {
    const timestamp = new Date().toLocaleTimeString()
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`)
}

function logStats() {
    const uptime = Math.floor((Date.now() - startTime) / 1000)
    console.log(`${colors.cyan}
╔══════════════════════════════════════╗
║           📊 ESTADÍSTICAS            ║
╠══════════════════════════════════════╣
║ Mensajes totales:     ${messageCount.toString().padStart(10)} ║
║ Lecturas sensores:    ${sensorReadingCount.toString().padStart(10)} ║
║ Cambios en BD:        ${databaseChangeCount.toString().padStart(10)} ║
║ Tiempo conectado:     ${uptime.toString().padStart(7)}s ║
╚══════════════════════════════════════╝${colors.reset}`)
}

function startWebSocketClient() {
    log('🚀 Iniciando cliente WebSocket de prueba...', 'bright')
    log(`📡 Conectando a: ${SERVER_URL}`, 'blue')
    
    const socket = io(SERVER_URL, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
    })

    // Eventos de conexión
    socket.on('connect', () => {
        log(`🟢 CONECTADO al servidor WebSocket (ID: ${socket.id})`, 'green')
        startTime = Date.now()
        
        // Solicitar datos iniciales
        log('📊 Solicitando datos iniciales...', 'yellow')
        socket.emit('request_initial_data', {
            deviceIds: [1, 2, 3, 999],
            limit: 5
        })
    })

    socket.on('disconnect', (reason) => {
        log(`🔴 DESCONECTADO (${reason})`, 'red')
    })

    socket.on('connect_error', (error) => {
        log(`❌ ERROR DE CONEXIÓN: ${error.message}`, 'red')
    })

    socket.on('reconnect', (attemptNumber) => {
        log(`🔄 RECONECTADO después de ${attemptNumber} intentos`, 'yellow')
    })

    // Eventos de la aplicación
    socket.on('new_sensor_reading', (data) => {
        messageCount++
        sensorReadingCount++
        
        log(`📊 NUEVA LECTURA DE SENSOR:`, 'green')
        console.log(`    📱 Dispositivo: ${data.deviceId}`)
        console.log(`    🔧 Sensor: ${data.sensorType || data.sensorName}`)
        console.log(`    📏 Valor: ${data.value} ${data.unit || ''}`)
        console.log(`    ⏰ Timestamp: ${data.timestamp}`)
        console.log('')
    })

    socket.on('database_change', (data) => {
        messageCount++
        databaseChangeCount++
        
        log(`🔄 CAMBIO EN BASE DE DATOS:`, 'yellow')
        console.log(`    📄 Tipo: ${data.type}`)
        console.log(`    🗂️  Colección: ${data.collection}`)
        console.log(`    ⏰ Timestamp: ${data.timestamp}`)
        console.log('')
    })

    socket.on('device_reading', (data) => {
        messageCount++
        log(`📱 LECTURA DE DISPOSITIVO SUSCRITO:`, 'magenta')
        console.log(`    📱 Dispositivo: ${data.deviceId}`)
        console.log(`    🔧 Sensor: ${data.sensorType || data.sensorName}`)
        console.log(`    📏 Valor: ${data.value} ${data.unit || ''}`)
        console.log('')
    })

    socket.on('new_device', (data) => {
        messageCount++
        log(`🆕 NUEVO DISPOSITIVO REGISTRADO:`, 'cyan')
        console.log(`    📱 ID: ${data.id}`)
        console.log(`    📝 Nombre: ${data.name}`)
        console.log(`    📅 Creado: ${data.createdAt}`)
        console.log('')
    })

    socket.on('initial_data', (data) => {
        messageCount++
        log(`📊 DATOS INICIALES RECIBIDOS:`, 'blue')
        console.log(`    📄 Tipo: ${data.type}`)
        console.log(`    📊 Dispositivos: ${data.data?.length || 0}`)
        console.log(`    💬 Mensaje: ${data.message}`)
        console.log('')
    })

    socket.on('test_response', (data) => {
        messageCount++
        log(`🧪 RESPUESTA DE PRUEBA:`, 'blue')
        console.log(`    💬 Mensaje: ${data.message}`)
        console.log(`    ⏰ Timestamp: ${data.timestamp}`)
        console.log('')
    })

    socket.on('error', (data) => {
        messageCount++
        log(`❌ ERROR DEL SERVIDOR:`, 'red')
        console.log(`    💬 Mensaje: ${data.message}`)
        console.log(`    📄 Tipo: ${data.type}`)
        console.log('')
    })

    // Controles interactivos
    setupInteractiveControls(socket)
    
    // Mostrar estadísticas cada 30 segundos
    setInterval(() => {
        if (socket.connected) {
            logStats()
        }
    }, 30000)

    return socket
}

function setupInteractiveControls(socket) {
    log('⌨️  Controles disponibles:', 'cyan')
    log('  - Presiona "t" + Enter para enviar mensaje de prueba', 'cyan')
    log('  - Presiona "d" + Enter para solicitar datos iniciales', 'cyan')
    log('  - Presiona "s" + Enter para mostrar estadísticas', 'cyan')
    log('  - Presiona "q" + Enter para salir', 'cyan')
    log('', 'reset')

    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (input) => {
        const command = input.toString().trim().toLowerCase()
        
        switch (command) {
            case 't':
                if (socket.connected) {
                    socket.emit('test_message', {
                        message: 'Mensaje de prueba desde cliente Node.js',
                        timestamp: new Date().toISOString()
                    })
                    log('🧪 Mensaje de prueba enviado', 'yellow')
                } else {
                    log('❌ No hay conexión WebSocket', 'red')
                }
                break
                
            case 'd':
                if (socket.connected) {
                    socket.emit('request_initial_data', {
                        deviceIds: [1, 2, 3, 999],
                        limit: 10
                    })
                    log('📊 Solicitando datos iniciales...', 'yellow')
                } else {
                    log('❌ No hay conexión WebSocket', 'red')
                }
                break
                
            case 's':
                logStats()
                break
                
            case 'q':
                log('👋 Cerrando cliente WebSocket...', 'yellow')
                socket.disconnect()
                process.exit(0)
                break
                
            default:
                log('⌨️  Comando no reconocido. Usa: t, d, s, q', 'yellow')
                break
        }
    })
}

// Iniciar cliente
log('🐱 CatHub - Cliente WebSocket de Prueba', 'bright')
log('=========================================', 'bright')

const socket = startWebSocketClient()

// Manejo de señales del sistema
process.on('SIGINT', () => {
    log('\n👋 Recibida señal de interrupción, cerrando...', 'yellow')
    socket.disconnect()
    process.exit(0)
})

process.on('SIGTERM', () => {
    log('\n👋 Recibida señal de terminación, cerrando...', 'yellow')
    socket.disconnect()
    process.exit(0)
})
