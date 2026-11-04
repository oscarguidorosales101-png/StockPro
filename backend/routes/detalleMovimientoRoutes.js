const express = require('express');
const router = express.Router();
const detalleMovimientoController = require('../controllers/detalleMovimientoController');

router.get('/', detalleMovimientoController.getAll);
router.get('/:id', detalleMovimientoController.getById);
router.post('/', detalleMovimientoController.create);
router.put('/:id', detalleMovimientoController.update);
router.delete('/:id', detalleMovimientoController.delete);

module.exports = router;

