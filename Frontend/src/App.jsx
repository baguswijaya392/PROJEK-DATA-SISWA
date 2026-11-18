
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Search,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  MapPin,
  CalendarDays,
  BookOpen,
  Menu,
  AlertCircle,
  CheckCircle2,
  Wifi,
  WifiOff,
  ArrowUpRight,
  Database,
  School,
  ChevronRight,
  Layers3,
} from "lucide-react";
import "./App.css";

const API_URL = "http://localhost:5000/api/siswa";

const EMPTY_FORM = {
  kode_siswa: "",
  nama_siswa: "",
  alamat_siswa: "",
  tgl_siswa: "",
  jurusan_siswa: "",
};

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(API_URL);
      setStudents(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Tidak dapat terhubung ke backend. Pastikan server aktif."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(""), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return students;

    return students.filter((student) =>
      [
        student.kode_siswa,
        student.nama_siswa,
        student.alamat_siswa,
        student.jurusan_siswa,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [students, search]);

  const departments = useMemo(() => {
    const result = {};

    students.forEach((student) => {
      const major = student.jurusan_siswa || "Belum ditentukan";
      result[major] = (result[major] || 0) + 1;
    });

    return Object.entries(result).sort((a, b) => b[1] - a[1]);
  }, [students]);

  const changePage = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
    setSearch("");
  };

  const openCreate = () => {
    setEditing(false);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (student) => {
    setEditing(true);
    setForm({
      kode_siswa: student.kode_siswa,
      nama_siswa: student.nama_siswa,
      alamat_siswa: student.alamat_siswa,
      tgl_siswa: student.tgl_siswa?.slice(0, 10) || "",
      jurusan_siswa: student.jurusan_siswa,
    });
    setModalOpen(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (editing) {
        await axios.put(
          `${API_URL}/${encodeURIComponent(form.kode_siswa)}`,
          {
            nama_siswa: form.nama_siswa,
            alamat_siswa: form.alamat_siswa,
            tgl_siswa: form.tgl_siswa,
            jurusan_siswa: form.jurusan_siswa,
          }
        );

        setNotification("Data siswa berhasil diperbarui.");
      } else {
        await axios.post(API_URL, form);
        setNotification("Siswa baru berhasil ditambahkan.");
      }

      setModalOpen(false);
      setForm(EMPTY_FORM);
      await fetchStudents();
    } catch (err) {
      setNotification(
        err.response?.data?.message || "Gagal menyimpan data siswa."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (student) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus data ${student.nama_siswa}?`
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/${encodeURIComponent(student.kode_siswa)}`
      );

      setNotification("Data siswa berhasil dihapus.");
      await fetchStudents();
    } catch (err) {
      setNotification(
        err.response?.data?.message || "Gagal menghapus data siswa."
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(`${String(date).slice(0, 10)}T00:00:00`)
      .toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
  };

  const pageTitles = {
    dashboard: "Dashboard Overview",
    students: "Student Directory",
    academic: "Academic Data",
  };

  function StudentTable({ showSearch = true, preview = false }) {
    const displayedStudents = preview
      ? students.slice(0, 5)
      : filteredStudents;

    return (
      <section className="directory-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              {preview ? "DATABASE PREVIEW" : "DATABASE MANAGEMENT"}
            </p>
            <h2>{preview ? "Recent Students" : "Student Records"}</h2>
            <p>
              {preview
                ? "Latest records from your student database."
                : "Manage, search, and organize student records."}
            </p>
          </div>

          <button className="refresh-button" onClick={fetchStudents}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {showSearch && (
          <div className="table-toolbar">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search name, code, address, or major..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <span className="record-count">
              SHOWING <strong>{filteredStudents.length}</strong> RECORDS
            </span>
          </div>
        )}

        <div className="table-wrapper">
          <table className="student-table">
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>ADDRESS</th>
                <th>DATE OF BIRTH</th>
                <th>STUDY PROGRAM</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    <RefreshCw className="loading-icon" size={25} />
                    <p>Loading student records...</p>
                  </td>
                </tr>
              ) : displayedStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    <Users size={30} />
                    <p>
                      {search
                        ? "No matching students found."
                        : "No student records available."}
                    </p>
                    {!search && !preview && (
                      <button onClick={openCreate}>
                        Add your first student
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                displayedStudents.map((student) => (
                  <tr key={student.kode_siswa}>
                    <td>
                      <div className="student-cell">
                        <div className="student-avatar">
                          {student.nama_siswa?.charAt(0).toUpperCase() || "S"}
                        </div>
                        <div>
                          <strong>{student.nama_siswa}</strong>
                          <small>{student.kode_siswa}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="detail-cell">
                        <MapPin size={14} />
                        {student.alamat_siswa}
                      </div>
                    </td>

                    <td>
                      <div className="detail-cell">
                        <CalendarDays size={14} />
                        {formatDate(student.tgl_siswa)}
                      </div>
                    </td>

                    <td>
                      <span className="major-badge">
                        {student.jurusan_siswa}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-button edit"
                          title="Edit student"
                          onClick={() => openEdit(student)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="action-button delete"
                          title="Delete student"
                          onClick={() => handleDelete(student)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            Total database records: <strong>{students.length}</strong>
          </span>
          <span>STUDENT MANAGEMENT SYSTEM</span>
        </div>
      </section>
    );
  }

  const renderDashboard = () => (
    <>
      <div className="welcome-section">
        <div>
          <p className="eyebrow">MANAGEMENT CENTER</p>
          <h2>
            Siswa <span>Overview.</span>
          </h2>
          <p className="welcome-description">
            Monitor and manage your student database in one place.
          </p>
        </div>

        <button className="primary-button" onClick={openCreate}>
          <Plus size={18} />
          Add New Student
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <Users size={21} />
          </div>
          <div className="stat-info">
            <p>TOTAL STUDENTS</p>
            <h3>{loading ? "..." : students.length}</h3>
            <span>Registered students</span>
          </div>
          <div className="stat-decoration">01</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <GraduationCap size={21} />
          </div>
          <div className="stat-info">
            <p>STUDY PROGRAMS</p>
            <h3>{loading ? "..." : departments.length}</h3>
            <span>Unique departments</span>
          </div>
          <div className="stat-decoration">02</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            {error ? <WifiOff size={21} /> : <CheckCircle2 size={21} />}
          </div>
          <div className="stat-info">
            <p>DATABASE STATUS</p>
            <h3 className={error ? "offline-text" : "online-text"}>
              {error ? "OFFLINE" : "ONLINE"}
            </h3>
            <span>Backend connection</span>
          </div>
          <div className="stat-decoration">03</div>
        </div>
      </div>

      <div className="dashboard-shortcuts">
        <button
          className="shortcut-card"
          onClick={() => changePage("students")}
        >
          <div className="shortcut-icon">
            <Users size={21} />
          </div>
          <div>
            <strong>Student Directory</strong>
            <p>View and manage all student records</p>
          </div>
          <ArrowUpRight size={18} />
        </button>

        <button
          className="shortcut-card"
          onClick={() => changePage("academic")}
        >
          <div className="shortcut-icon academic-icon">
            <BookOpen size={21} />
          </div>
          <div>
            <strong>Academic Data</strong>
            <p>View student distribution by program</p>
          </div>
          <ArrowUpRight size={18} />
        </button>
      </div>

      <StudentTable showSearch={false} preview />
    </>
  );

  const renderStudentDirectory = () => (
    <>
      <div className="welcome-section">
        <div>
          <p className="eyebrow">STUDENT DATABASE</p>
          <h2>
            Student <span>Directory.</span>
          </h2>
          <p className="welcome-description">
            Add, update, search, and manage student records.
          </p>
        </div>

        <button className="primary-button" onClick={openCreate}>
          <Plus size={18} />
          Add New Student
        </button>
      </div>

      <div className="directory-summary">
        <div>
          <Users size={20} />
          <span>Total registered students</span>
          <strong>{loading ? "..." : students.length}</strong>
        </div>
        <div>
          <Database size={20} />
          <span>Database source</span>
          <strong>MySQL</strong>
        </div>
      </div>

      <StudentTable />
    </>
  );

  const renderAcademic = () => (
    <>
      <div className="welcome-section">
        <div>
          <p className="eyebrow">ACADEMIC MANAGEMENT</p>
          <h2>
            Academic <span>Data.</span>
          </h2>
          <p className="welcome-description">
            Student distribution and study program overview.
          </p>
        </div>

        <button className="refresh-button" onClick={fetchStudents}>
          <RefreshCw size={16} />
          Refresh Data
        </button>
      </div>

      <div className="academic-overview">
        <div className="academic-total-card">
          <div className="stat-icon green">
            <School size={22} />
          </div>
          <div>
            <p>TOTAL STUDENTS</p>
            <h3>{loading ? "..." : students.length}</h3>
            <span>Across all study programs</span>
          </div>
        </div>

        <div className="academic-total-card">
          <div className="stat-icon purple">
            <Layers3 size={22} />
          </div>
          <div>
            <p>TOTAL STUDY PROGRAMS</p>
            <h3>{loading ? "..." : departments.length}</h3>
            <span>Unique registered programs</span>
          </div>
        </div>
      </div>

      <section className="academic-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PROGRAM DISTRIBUTION</p>
            <h2>Students by Department</h2>
            <p>Distribution calculated from student records.</p>
          </div>
          <BookOpen size={25} className="heading-icon" />
        </div>

        {loading ? (
          <div className="academic-empty">
            <RefreshCw className="loading-icon" size={24} />
            <p>Loading academic data...</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="academic-empty">
            <BookOpen size={30} />
            <p>No academic data available yet.</p>
          </div>
        ) : (
          <div className="department-list">
            {departments.map(([name, count], index) => {
              const percentage = students.length
                ? Math.round((count / students.length) * 100)
                : 0;

              return (
                <div className="department-card" key={name}>
                  <div className="department-top">
                    <div className="department-symbol">
                      <GraduationCap size={20} />
                    </div>

                    <div className="department-name">
                      <strong>{name}</strong>
                      <span>Study program #{index + 1}</span>
                    </div>

                    <div className="department-count">
                      <strong>{count}</strong>
                      <span>STUDENTS</span>
                    </div>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="department-bottom">
                    <span>Student distribution</span>
                    <strong>{percentage}%</strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="academic-note">
        <AlertCircle size={18} />
        <p>
          Academic statistics are generated from the current student database.
          Add or update student records to refresh this information.
        </p>
      </div>

      <button
        className="secondary-page-button"
        onClick={() => changePage("students")}
      >
        <Users size={17} />
        Open Student Directory
        <ChevronRight size={16} />
      </button>
    </>
  );

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <GraduationCap size={25} />
          </div>
          <div>
            <h2>
              STUDENT<span>.</span>
            </h2>
            <p>MANAGEMENT SYSTEM</p>
          </div>
          <button
            className="close-sidebar"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-label">MAIN MENU</div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${
              activePage === "dashboard" ? "active" : ""
            }`}
            onClick={() => changePage("dashboard")}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${
              activePage === "students" ? "active" : ""
            }`}
            onClick={() => changePage("students")}
          >
            <Users size={19} />
            <span>Student Directory</span>
          </button>

          <button
            className={`nav-item ${
              activePage === "academic" ? "active" : ""
            }`}
            onClick={() => changePage("academic")}
          >
            <BookOpen size={19} />
            <span>Academic Data</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className={`status-dot ${error ? "status-offline" : ""}`} />
            <div>
              <strong>{error ? "System Offline" : "System Online"}</strong>
              <small>Student Management v1.0</small>
            </div>
          </div>
          <p className="sidebar-footer">© 2026 STUDENT SYSTEM</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <div className="breadcrumb">
                STUDENT MANAGEMENT / {pageTitles[activePage].toUpperCase()}
              </div>
              <h1>{pageTitles[activePage]}</h1>
            </div>
          </div>

          <div className="topbar-right">
            <div
              className={`connection-status ${
                error ? "disconnected" : ""
              }`}
            >
              {error ? <WifiOff size={15} /> : <Wifi size={15} />}
              <span>{error ? "Disconnected" : "API Connected"}</span>
            </div>
            <div className="profile-avatar">SW</div>
          </div>
        </header>

        <section className="page-content">
          {error && (
            <div className="error-banner">
              <AlertCircle size={19} />
              <span>{error}</span>
              <button onClick={fetchStudents}>Try Again</button>
            </div>
          )}

          {activePage === "dashboard" && renderDashboard()}
          {activePage === "students" && renderStudentDirectory()}
          {activePage === "academic" && renderAcademic()}

          <footer className="main-footer">
            <span>STUDENT MANAGEMENT SYSTEM</span>
            <span>BUILT WITH REACT · EXPRESS · MYSQL</span>
          </footer>
        </section>
      </main>

      {modalOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <div className="student-modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  {editing ? "UPDATE RECORD" : "NEW RECORD"}
                </p>
                <h2>{editing ? "Edit Student" : "Add New Student"}</h2>
                <p>Fill in the student information below.</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label className="form-field">
                  <span>STUDENT CODE</span>
                  <input
                    name="kode_siswa"
                    value={form.kode_siswa}
                    onChange={handleChange}
                    placeholder="Example: S004"
                    disabled={editing}
                    required
                  />
                </label>

                <label className="form-field">
                  <span>FULL NAME</span>
                  <input
                    name="nama_siswa"
                    value={form.nama_siswa}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                  />
                </label>

                <label className="form-field full-width">
                  <span>ADDRESS</span>
                  <textarea
                    name="alamat_siswa"
                    value={form.alamat_siswa}
                    onChange={handleChange}
                    placeholder="Enter student address"
                    rows="3"
                    required
                  />
                </label>

                <label className="form-field">
                  <span>DATE OF BIRTH</span>
                  <input
                    type="date"
                    name="tgl_siswa"
                    value={form.tgl_siswa}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="form-field">
                  <span>STUDY PROGRAM</span>
                  <input
                    name="jurusan_siswa"
                    value={form.jurusan_siswa}
                    onChange={handleChange}
                    placeholder="Enter study program"
                    required
                  />
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editing
                      ? "Save Changes"
                      : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {notification && (
        <div className="notification">
          <CheckCircle2 size={18} />
          {notification}
        </div>
      )}
    </div>
  );
}

export default App;
