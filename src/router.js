const express = require('express');
const router = express.Router();
const CT_select = require('./controles/CT_select');
const validacao = require('./validar/validacao');


router.get('/selectaluno',  CT_select.getAlunos);

//router.post('/tasks', tasksMiddleware.validateFieldTitle, tasksController.createTask);
//router.delete('/tasks/:id', tasksController.deleteTask);
//router.put('/tasks/:id', tasksMiddleware.validateFieldTitle, tasksController.updateTask);


module.exports = router;