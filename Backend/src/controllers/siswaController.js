
const db = require("../config/database");

// GET ALL SISWA
exports.getAllSiswa = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM siswa ORDER BY created_at DESC"
        );

        res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET SISWA BY KODE
exports.getSiswaByKode = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM siswa WHERE kode_siswa = ?",
            [req.params.kode]
        );

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Siswa tidak ditemukan"
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// CREATE SISWA
exports.createSiswa = async (req, res) => {
    try {
        const {
            kode_siswa,
            nama_siswa,
            alamat_siswa,
            tgl_siswa,
            jurusan_siswa
        } = req.body;

        if (
            !kode_siswa ||
            !nama_siswa ||
            !alamat_siswa ||
            !tgl_siswa ||
            !jurusan_siswa
        ) {
            return res.status(400).json({
                success: false,
                message: "Semua field wajib diisi"
            });
        }

        await db.query(
            `INSERT INTO siswa
            (kode_siswa, nama_siswa, alamat_siswa, tgl_siswa, jurusan_siswa)
            VALUES (?, ?, ?, ?, ?)`,
            [
                kode_siswa,
                nama_siswa,
                alamat_siswa,
                tgl_siswa,
                jurusan_siswa
            ]
        );

        res.status(201).json({
            success: true,
            message: "Siswa berhasil ditambahkan"
        });
    } catch (error) {
        res.status(error.code === "ER_DUP_ENTRY" ? 409 : 500).json({
            success: false,
            message: error.code === "ER_DUP_ENTRY"
                ? "Kode siswa sudah digunakan"
                : error.message
        });
    }
};

// UPDATE SISWA
exports.updateSiswa = async (req, res) => {
    try {
        const {
            nama_siswa,
            alamat_siswa,
            tgl_siswa,
            jurusan_siswa
        } = req.body;

        if (
            !nama_siswa ||
            !alamat_siswa ||
            !tgl_siswa ||
            !jurusan_siswa
        ) {
            return res.status(400).json({
                success: false,
                message: "Semua field wajib diisi"
            });
        }

        const [result] = await db.query(
            `UPDATE siswa SET
                nama_siswa = ?,
                alamat_siswa = ?,
                tgl_siswa = ?,
                jurusan_siswa = ?
            WHERE kode_siswa = ?`,
            [
                nama_siswa,
                alamat_siswa,
                tgl_siswa,
                jurusan_siswa,
                req.params.kode
            ]
        );

        if (!result.affectedRows) {
            return res.status(404).json({
                success: false,
                message: "Siswa tidak ditemukan"
            });
        }

        res.json({
            success: true,
            message: "Siswa berhasil diperbarui"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE SISWA
exports.deleteSiswa = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM siswa WHERE kode_siswa = ?",
            [req.params.kode]
        );

        if (!result.affectedRows) {
            return res.status(404).json({
                success: false,
                message: "Siswa tidak ditemukan"
            });
        }

        res.json({
            success: true,
            message: "Siswa berhasil dihapus"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
