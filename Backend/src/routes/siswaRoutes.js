
const express = require("express");
const router = express.Router();

const siswaController = require("../controllers/siswaController");

router.get("/", siswaController.getAllSiswa);
router.get("/:kode", siswaController.getSiswaByKode);
router.post("/", siswaController.createSiswa);
router.put("/:kode", siswaController.updateSiswa);
router.delete("/:kode", siswaController.deleteSiswa);

module.exports = router;
