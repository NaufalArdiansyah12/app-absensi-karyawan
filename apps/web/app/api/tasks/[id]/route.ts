import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-jwt";
import { dataStore } from "@/lib/store";
import { syncTaskUpdateToD1, syncTaskDeleteToD1 } from "@/lib/d1-client";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dataStore.init();
    const { user, errorResponse } = await authenticateRequest(request, [
      "SUPER_USER",
      "GM",
      "HR",
      "EMPLOYEE",
    ]);
    if (errorResponse) return errorResponse;

    const task = dataStore.tasks.find((t) => t.id === params.id);
    if (!task) {
      return NextResponse.json({ error: "Tugas tidak ditemukan" }, { status: 404 });
    }

    if (user!.role === "EMPLOYEE" && task.assignedTo !== user!.userId) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    return NextResponse.json({ task });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await dataStore.init();
    const { user, errorResponse } = await authenticateRequest(request, [
      "SUPER_USER",
      "GM",
      "EMPLOYEE",
    ]);
    if (errorResponse) return errorResponse;

    const taskIndex = dataStore.tasks.findIndex((t) => t.id === params.id);
    if (taskIndex === -1) {
      return NextResponse.json({ error: "Tugas tidak ditemukan" }, { status: 404 });
    }

    const task = dataStore.tasks[taskIndex];
    const body: any = await request.json();

    // Employee updates: can start (IN_PROGRESS) or submit (COMPLETED with completionNotes)
    if (user!.role === "EMPLOYEE") {
      if (task.assignedTo !== user!.userId) {
        return NextResponse.json({ error: "Hanya penerima tugas yang dapat mengubah status" }, { status: 403 });
      }

      const { status, completionNotes } = body;
      if (status && !["IN_PROGRESS", "COMPLETED"].includes(status)) {
        return NextResponse.json(
          { error: "Karyawan hanya dapat memindahkan status ke IN_PROGRESS atau COMPLETED" },
          { status: 400 }
        );
      }

      if (status) task.status = status;
      if (completionNotes !== undefined) task.completionNotes = completionNotes;
      task.updatedAt = Date.now();

      try {
        await syncTaskUpdateToD1({
          title: task.title,
          status: task.status,
          completionNotes: task.completionNotes,
        });
      } catch (_) {}

      return NextResponse.json({ success: true, task });
    }

    // GM / SUPER_USER updates:
    const { status, revisionNotes, completionNotes, title, description, priority, dueDate, assignedTo } = body;

    if (status) {
      const validStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CLOSED"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
      }
      task.status = status;
    }

    if (revisionNotes !== undefined) task.revisionNotes = revisionNotes;
    if (completionNotes !== undefined) task.completionNotes = completionNotes;
    if (title) task.title = title.trim();
    if (description) task.description = description.trim();
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;

    if (assignedTo && assignedTo !== task.assignedTo) {
      const emp = dataStore.users.find((u) => u.id === assignedTo);
      if (emp) {
        task.assignedTo = emp.id;
        task.assignedToName = emp.name;
        task.assignedToDivision = emp.division;
      }
    }

    task.updatedAt = Date.now();

    dataStore.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: user!.userId,
      action: "TASK_UPDATED",
      details: `Status tugas '${task.title}' diubah menjadi ${task.status}`,
      createdAt: Date.now(),
    });

    try {
      await syncTaskUpdateToD1({
        title: task.title,
        status: task.status,
        completionNotes: task.completionNotes,
        revisionNotes: task.revisionNotes,
      });
    } catch (_) {}

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dataStore.init();
    const { user, errorResponse } = await authenticateRequest(request, ["SUPER_USER", "GM"]);
    if (errorResponse) return errorResponse;

    const taskIndex = dataStore.tasks.findIndex((t) => t.id === params.id);
    if (taskIndex === -1) {
      return NextResponse.json({ error: "Tugas tidak ditemukan" }, { status: 404 });
    }

    const removed = dataStore.tasks.splice(taskIndex, 1)[0];

    dataStore.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: user!.userId,
      action: "TASK_DELETED",
      details: `GM menghapus tugas '${removed.title}'`,
      createdAt: Date.now(),
    });

    try {
      await syncTaskDeleteToD1(removed.title);
    } catch (_) {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
