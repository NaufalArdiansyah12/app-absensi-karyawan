"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Hourglass,
  ArrowRight,
  RotateCcw,
  Trash2,
  X,
  Kanban,
  List,
  AlertTriangle,
  ChevronRight,
  Send,
  Building,
  Loader2,
  UserCheck,
} from "lucide-react";
import { card, pill, btnDark, linkBtn, input } from "@/components/gm-shared";

interface Task {
  id: string;
  title: string;
  description: string;
  assignedBy: string;
  assignedByName?: string;
  assignedTo: string;
  assignedToName?: string;
  assignedToDivision?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CLOSED";
  dueDate: string;
  completionNotes?: string;
  revisionNotes?: string;
  createdAt: number;
  updatedAt: number;
}

interface Employee {
  id: string;
  name: string;
  nik: string;
  division: string;
  jobPosition: string;
}

const PRIORITY_CONFIG = {
  URGENT: { label: "Urgent", bg: "bg-rose-500 text-white", border: "border-rose-200", dot: "bg-rose-500" },
  HIGH: { label: "Tinggi", bg: "bg-amber-500 text-white", border: "border-amber-200", dot: "bg-amber-500" },
  MEDIUM: { label: "Sedang", bg: "bg-sky-500 text-white", border: "border-sky-200", dot: "bg-sky-500" },
  LOW: { label: "Rendah", bg: "bg-slate-400 text-white", border: "border-slate-200", dot: "bg-slate-400" },
};

const COLUMNS: { key: Task["status"]; title: string; subtitle: string; bg: string; border: string; accent: string }[] = [
  {
    key: "PENDING",
    title: "Belum Mulai",
    subtitle: "Tugas baru ditugaskan",
    bg: "bg-slate-50/70",
    border: "border-slate-200/80",
    accent: "text-slate-700 bg-slate-200/70",
  },
  {
    key: "IN_PROGRESS",
    title: "Sedang Dikerjakan",
    subtitle: "Dalam proses oleh staf",
    bg: "bg-blue-50/40",
    border: "border-blue-200/80",
    accent: "text-blue-700 bg-blue-100",
  },
  {
    key: "COMPLETED",
    title: "Review GM",
    subtitle: "Menunggu approval hasil",
    bg: "bg-amber-50/50",
    border: "border-amber-200/80",
    accent: "text-amber-800 bg-amber-200",
  },
  {
    key: "CLOSED",
    title: "Selesai",
    subtitle: "Disetujui & diarsipkan",
    bg: "bg-emerald-50/40",
    border: "border-emerald-200/80",
    accent: "text-emerald-700 bg-emerald-100",
  },
];

export default function GMPenugasanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Controls
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [employeeFilter, setEmployeeFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "MEDIUM" as Task["priority"],
    dueDate: new Date().toISOString().split("T")[0],
  });

  // Revision state
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [revisionText, setRevisionText] = useState("");

  // Debounced Employee Search for Create Modal
  const [empSearch, setEmpSearch] = useState("");
  const [debouncedEmpSearch, setDebouncedEmpSearch] = useState("");
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [empDropdownOpen, setEmpDropdownOpen] = useState(false);
  const empPickerRef = useRef<HTMLDivElement>(null);

  // Debounce handler (300ms)
  useEffect(() => {
    setIsDebouncing(true);
    const handler = setTimeout(() => {
      setDebouncedEmpSearch(empSearch);
      setIsDebouncing(false);
    }, 300);

    return () => clearTimeout(handler);
  }, [empSearch]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (empPickerRef.current && !empPickerRef.current.contains(e.target as Node)) {
        setEmpDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchedEmployees = useMemo(() => {
    if (!debouncedEmpSearch.trim()) return employees;
    const q = debouncedEmpSearch.toLowerCase();
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.nik.toLowerCase().includes(q) ||
        e.division.toLowerCase().includes(q) ||
        e.jobPosition.toLowerCase().includes(q)
    );
  }, [employees, debouncedEmpSearch]);

  const selectedEmployeeObj = useMemo(() => {
    return employees.find((e) => e.id === formData.assignedTo);
  }, [employees, formData.assignedTo]);

  const fetchData = async () => {
    try {
      const [resTasks, resUsers] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/master/users"),
      ]);

      const dataTasks: any = await resTasks.json();
      const dataUsers: any = await resUsers.json();

      if (dataTasks.tasks) setTasks(dataTasks.tasks);
      if (dataUsers.users) {
        const emps = dataUsers.users.filter((u: any) => u.role === "EMPLOYEE");
        setEmployees(emps);
      }
    } catch (err) {
      console.error("Gagal memuat data penugasan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        (t.assignedToName && t.assignedToName.toLowerCase().includes(search.toLowerCase()));

      const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
      const matchesEmployee = employeeFilter === "ALL" || t.assignedTo === employeeFilter;

      return matchesSearch && matchesPriority && matchesEmployee;
    });
  }, [tasks, search, priorityFilter, employeeFilter]);

  // Metrics
  const metrics = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "PENDING").length,
      inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      review: tasks.filter((t) => t.status === "COMPLETED").length,
      closed: tasks.filter((t) => t.status === "CLOSED").length,
    };
  }, [tasks]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.assignedTo || !formData.dueDate) {
      alert("Harap lengkapi semua field yang wajib diisi!");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resData: any = await res.json();
      if (!res.ok) throw new Error(resData.error || "Gagal membuat penugasan");

      setShowCreateModal(false);
      setFormData({
        title: "",
        description: "",
        assignedTo: "",
        priority: "MEDIUM",
        dueDate: new Date().toISOString().split("T")[0],
      });
      setEmpSearch("");
      setEmpDropdownOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: Task["status"], extraPayload?: any) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, ...extraPayload }),
      });

      const resData: any = await res.json();
      if (!res.ok) throw new Error(resData.error || "Gagal memperbarui status");

      if (selectedTask?.id === taskId) {
        setSelectedTask(resData.task);
      }
      setShowRevisionInput(false);
      setRevisionText("");
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus penugasan ini?")) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus penugasan");

      setSelectedTask(null);
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === "CLOSED") return false;
    const today = new Date().toISOString().split("T")[0];
    return dueDate < today;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Papan Penugasan</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Delegasikan tugas spesifik ke karyawan, pantau progres real-time, dan verifikasi hasil kerja.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full bg-zinc-100 p-1 border border-zinc-200">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                viewMode === "kanban" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                viewMode === "list" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Tabel
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Tugas Baru
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className={`${card} flex items-center justify-between p-4`}>
          <div>
            <div className="text-[11px] font-medium text-zinc-500">Total Penugasan</div>
            <div className="mt-1 text-2xl font-bold text-zinc-900">{metrics.total}</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
            <CheckSquare className="h-5 w-5" />
          </div>
        </div>

        <div className={`${card} flex items-center justify-between p-4`}>
          <div>
            <div className="text-[11px] font-medium text-blue-600">Dalam Pengerjaan</div>
            <div className="mt-1 text-2xl font-bold text-zinc-900">{metrics.inProgress}</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Hourglass className="h-5 w-5" />
          </div>
        </div>

        <div className={`${card} flex items-center justify-between p-4`}>
          <div>
            <div className="text-[11px] font-medium text-amber-700">Review GM</div>
            <div className="mt-1 text-2xl font-bold text-zinc-900 flex items-center gap-2">
              {metrics.review}
              {metrics.review > 0 && (
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        <div className={`${card} flex items-center justify-between p-4`}>
          <div>
            <div className="text-[11px] font-medium text-emerald-600">Tugas Selesai</div>
            <div className="mt-1 text-2xl font-bold text-zinc-900">{metrics.closed}</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className={`${card} p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between`}>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari tugas atau nama karyawan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-zinc-200 bg-zinc-50/70 pl-9 pr-4 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="ALL">Semua Prioritas</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">Tinggi</option>
            <option value="MEDIUM">Sedang</option>
            <option value="LOW">Rendah</option>
          </select>

          {/* Employee filter */}
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="ALL">Semua Karyawan</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.division})
              </option>
            ))}
          </select>

          {(search || priorityFilter !== "ALL" || employeeFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearch("");
                setPriorityFilter("ALL");
                setEmployeeFilter("ALL");
              }}
              className="text-xs text-zinc-500 hover:text-zinc-900 underline px-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Kanban or Table */}
      {loading ? (
        <div className={`${card} p-12 text-center text-xs text-zinc-400`}>
          Memuat papan penugasan...
        </div>
      ) : viewMode === "kanban" ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);

            return (
              <div
                key={col.key}
                className={`rounded-2xl border ${col.border} ${col.bg} p-3.5 flex flex-col min-h-[500px]`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-800">{col.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${col.accent}`}>
                      {colTasks.length}
                    </span>
                  </div>
                  {col.key === "COMPLETED" && colTasks.length > 0 && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-200/80 px-2 py-0.5 rounded-full animate-pulse">
                      Butuh GM
                    </span>
                  )}
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-zinc-200/90 rounded-xl bg-white/40">
                      <p className="text-[11px] text-zinc-400">Tidak ada tugas</p>
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const overdue = isOverdue(task.dueDate, task.status);
                      const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;

                      return (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className="group relative rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-sm transition-all hover:border-zinc-300 hover:shadow cursor-pointer"
                        >
                          {/* Card Top: Priority & Due Date */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${priority.bg}`}>
                              {priority.label}
                            </span>

                            <div
                              className={`flex items-center gap-1 text-[11px] font-medium ${
                                overdue ? "text-rose-600 font-bold" : "text-zinc-500"
                              }`}
                            >
                              <Calendar className="h-3 w-3" />
                              <span>{task.dueDate}</span>
                              {overdue && (
                                <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-bold">
                                  Lewat
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Title & Desc */}
                          <h4 className="text-xs font-bold text-zinc-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                            {task.title}
                          </h4>
                          <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1 leading-relaxed">
                            {task.description}
                          </p>

                          {/* Completion Preview in Review column */}
                          {task.status === "COMPLETED" && task.completionNotes && (
                            <div className="mt-2 rounded-lg bg-amber-50/80 border border-amber-200/80 p-2 text-[10px] text-amber-900 line-clamp-2">
                              <span className="font-bold">Laporan Staf: </span>
                              {task.completionNotes}
                            </div>
                          )}

                          {/* Card Footer: Assignee & Action */}
                          <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <div className="h-5 w-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">
                                {task.assignedToName?.charAt(0) || "U"}
                              </div>
                              <div className="truncate max-w-[110px]">
                                <p className="font-semibold text-zinc-800 truncate text-[11px]">
                                  {task.assignedToName}
                                </p>
                                <p className="text-[10px] text-zinc-400 truncate">
                                  {task.assignedToDivision}
                                </p>
                              </div>
                            </div>

                            <span className="text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all">
                              <ChevronRight className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List / Table View */
        <div className={`${card} p-0 overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Tugas</th>
                  <th className="px-4 py-3.5">Ditugaskan Ke</th>
                  <th className="px-4 py-3.5">Prioritas</th>
                  <th className="px-4 py-3.5">Tenggat Waktu</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-zinc-400">
                      Tidak ada tugas yang sesuai kriteria.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => {
                    const priority = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.MEDIUM;
                    const overdue = isOverdue(t.dueDate, t.status);

                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTask(t)}
                        className="hover:bg-zinc-50/80 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-3.5 max-w-xs">
                          <div className="font-bold text-zinc-900">{t.title}</div>
                          <div className="text-[11px] text-zinc-500 line-clamp-1">{t.description}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-zinc-800">{t.assignedToName}</div>
                          <div className="text-[10px] text-zinc-400">{t.assignedToDivision}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${priority.bg}`}>
                            {priority.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className={`font-medium ${overdue ? "text-rose-600 font-bold" : "text-zinc-600"}`}>
                            {t.dueDate}
                            {overdue && <span className="ml-1 text-[10px] text-rose-500">(Overdue)</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {t.status === "PENDING" && (
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              Belum Mulai
                            </span>
                          )}
                          {t.status === "IN_PROGRESS" && (
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                              Dikerjakan
                            </span>
                          )}
                          {t.status === "COMPLETED" && (
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              Review GM
                            </span>
                          )}
                          {t.status === "CLOSED" && (
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Selesai
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTask(t);
                            }}
                            className={linkBtn}
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Buat Penugasan Baru */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-zinc-950 text-white flex items-center justify-center">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Buat Penugasan Baru</h3>
                  <p className="text-[11px] text-zinc-500">Tugaskan instruksi kerja ke staf karyawan</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Judul Penugasan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Audit Stok Fisik Gudang Bahan Baku"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Instruksi / Rincian Pekerjaan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Jelaskan secara spesifik apa yang harus diselesaikan, standar hasil, atau tautan dokumen..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Penerima Tugas (Wajib) <span className="text-rose-500">*</span>
                  </label>

                  {selectedEmployeeObj ? (
                    <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50/70 p-2">
                      <div className="flex items-center gap-2 truncate">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-[11px] font-bold text-white">
                          {selectedEmployeeObj.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-zinc-900 truncate">{selectedEmployeeObj.name}</div>
                          <div className="text-[10px] text-zinc-500 truncate">
                            {selectedEmployeeObj.nik} • {selectedEmployeeObj.division}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, assignedTo: "" });
                          setEmpSearch("");
                          setEmpDropdownOpen(true);
                        }}
                        className="shrink-0 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[10px] font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors ml-2"
                      >
                        Ganti
                      </button>
                    </div>
                  ) : (
                    <div ref={empPickerRef} className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                        <input
                          type="text"
                          placeholder="Cari nama, NIK, divisi..."
                          value={empSearch}
                          onFocus={() => setEmpDropdownOpen(true)}
                          onChange={(e) => {
                            setEmpSearch(e.target.value);
                            setEmpDropdownOpen(true);
                          }}
                          className="w-full rounded-xl border border-zinc-200 bg-white pl-8 pr-7 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                        />
                        {isDebouncing && (
                          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 animate-spin" />
                        )}
                      </div>

                      {empDropdownOpen && (
                        <div className="absolute left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-lg">
                          {searchedEmployees.length === 0 ? (
                            <div className="p-3 text-center text-xs text-zinc-400">
                              {isDebouncing ? "Mencari karyawan..." : "Tidak ada karyawan yang cocok"}
                            </div>
                          ) : (
                            searchedEmployees.map((emp) => (
                              <button
                                key={emp.id}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, assignedTo: emp.id });
                                  setEmpDropdownOpen(false);
                                  setEmpSearch("");
                                }}
                                className="flex w-full items-center justify-between gap-2 rounded-lg p-2 text-left hover:bg-zinc-50 transition-colors"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">
                                    {emp.name.charAt(0)}
                                  </div>
                                  <div className="truncate">
                                    <div className="text-xs font-semibold text-zinc-900 truncate">{emp.name}</div>
                                    <div className="text-[10px] text-zinc-400 truncate">
                                      {emp.nik} • {emp.division}
                                    </div>
                                  </div>
                                </div>
                                <span className="shrink-0 text-[10px] font-medium bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">
                                  {emp.jobPosition}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Tenggat Waktu (Deadline) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Tingkat Prioritas <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["LOW", "MEDIUM", "HIGH", "URGENT"] as const).map((p) => {
                    const cfg = PRIORITY_CONFIG[p];
                    const active = formData.priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: p })}
                        className={`rounded-xl border py-2 text-center text-xs font-bold transition-all ${
                          active
                            ? `${cfg.bg} border-transparent shadow-sm ring-2 ring-zinc-900/10`
                            : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                        }`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-full bg-zinc-950 px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  {actionLoading ? "Menyimpan..." : "Tugaskan Sekarang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detail & Review Penugasan */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      PRIORITY_CONFIG[selectedTask.priority]?.bg
                    }`}
                  >
                    {PRIORITY_CONFIG[selectedTask.priority]?.label}
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-400">
                    ID: {selectedTask.id}
                  </span>
                </div>
                <h3 className="text-base font-bold text-zinc-900">{selectedTask.title}</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setShowRevisionInput(false);
                }}
                className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Details */}
            <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-zinc-50 p-3.5 border border-zinc-100 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 block font-medium">Penerima Tugas</span>
                  <span className="font-bold text-zinc-900">{selectedTask.assignedToName}</span>
                  <span className="text-[10px] text-zinc-500 block">{selectedTask.assignedToDivision}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block font-medium">Tenggat Waktu</span>
                  <span
                    className={`font-bold ${
                      isOverdue(selectedTask.dueDate, selectedTask.status) ? "text-rose-600" : "text-zinc-900"
                    }`}
                  >
                    {selectedTask.dueDate}
                  </span>
                  {isOverdue(selectedTask.dueDate, selectedTask.status) && (
                    <span className="text-[10px] text-rose-500 font-bold block">Melewati batas deadline</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block font-medium">Pemberi Tugas</span>
                  <span className="font-bold text-zinc-900">{selectedTask.assignedByName || "GM"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block font-medium">Status Saat Ini</span>
                  <span className="font-bold text-zinc-900">
                    {selectedTask.status === "PENDING" && "Belum Mulai"}
                    {selectedTask.status === "IN_PROGRESS" && "Sedang Dikerjakan"}
                    {selectedTask.status === "COMPLETED" && "Menunggu Review GM"}
                    {selectedTask.status === "CLOSED" && "Selesai (Ditutup)"}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-zinc-700 mb-1">Rincian Instruksi GM:</h4>
                <div className="rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap">
                  {selectedTask.description}
                </div>
              </div>

              {/* Employee Completion Report */}
              {selectedTask.completionNotes && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <CheckCircle2 className="h-4 w-4 text-amber-700" />
                    Laporan Hasil Pengerjaan oleh Staf:
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed pl-5 whitespace-pre-wrap">
                    {selectedTask.completionNotes}
                  </p>
                </div>
              )}

              {/* Revision History */}
              {selectedTask.revisionNotes && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                    <RotateCcw className="h-4 w-4 text-rose-600" />
                    Catatan Revisi Terakhir dari GM:
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed pl-5 whitespace-pre-wrap">
                    {selectedTask.revisionNotes}
                  </p>
                </div>
              )}

              {/* GM Decision Actions (Especially when status is COMPLETED) */}
              {selectedTask.status === "COMPLETED" && (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 space-y-3">
                  <div className="text-xs font-bold text-zinc-900 flex items-center justify-between">
                    <span>Keputusan Review GM:</span>
                    <span className="text-[10px] text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                      Menunggu respon Anda
                    </span>
                  </div>

                  {!showRevisionInput ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setShowRevisionInput(true)}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Minta Revisi
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedTask.id, "CLOSED")}
                        disabled={actionLoading}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Setujui & Selesaikan
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        placeholder="Tuliskan catatan revisi apa saja yang perlu diperbaiki karyawan..."
                        value={revisionText}
                        onChange={(e) => setRevisionText(e.target.value)}
                        className="w-full rounded-xl border border-rose-300 bg-white p-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowRevisionInput(false)}
                          className="rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-200"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading || !revisionText.trim()}
                          onClick={() =>
                            handleUpdateStatus(selectedTask.id, "IN_PROGRESS", { revisionNotes: revisionText })
                          }
                          className="rounded-full bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                        >
                          Kirim Catatan Revisi
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Quick Changer for GM */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-500">Ubah Status Manual:</span>
                <div className="flex items-center gap-1.5">
                  {(["PENDING", "IN_PROGRESS", "CLOSED"] as const).map((st) => (
                    <button
                      key={st}
                      disabled={actionLoading || selectedTask.status === st}
                      onClick={() => handleUpdateStatus(selectedTask.id, st)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                        selectedTask.status === st
                          ? "bg-zinc-900 text-white"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                      }`}
                    >
                      {st === "PENDING" && "Belum"}
                      {st === "IN_PROGRESS" && "Dikerjakan"}
                      {st === "CLOSED" && "Selesai"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="mt-5 flex items-center justify-between pt-4 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => handleDeleteTask(selectedTask.id)}
                disabled={actionLoading}
                className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Hapus Tugas
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedTask(null);
                  setShowRevisionInput(false);
                }}
                className="rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
