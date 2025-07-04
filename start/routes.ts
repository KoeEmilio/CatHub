/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const UsersController = () => import('../app/controllers/users_controller.js')
const DispositivosController = () => import('../app/controllers/dispositivos_controller.js')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.post('/users', [UsersController, 'store'])
router.post('/dispositivos', [DispositivosController, 'store'])
