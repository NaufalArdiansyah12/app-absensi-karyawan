import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-jwt";
import { dataStore, TaskItem } from "@/lib/store";
import { syncTaskCreateToD1 } from "@/lib/d1-client";

export async function GET(request: Request) {
  try {
    await dataStore.init();
    const { user, errorResponse } = await authenticateRequest(request, [
      "SUPER_USER",
      "GM",
      "HR",
      "EMPLOYEE",
    ]);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const assignedTo = searchParams.get("assignedTo");
    const priority = searchParams.get("priority");

    let list = [...dataStore.tasks];

    // Employee only sees their own assigned tasks
    if (user!.role === "EMPLOYEE") {
      list = list.filter((t) => t.assignedTo === user!.userId);
    } else if (assignedTo) {
      list = list.filter((t) => t.assignedTo === assignedTo);
    }

    if (status) {
      list = list.filter((t) => t.status === status);
    }
    if (priority) {
      list = list.filter((t) => t.priority === priority);
    }

    // Sort newest first
    list.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json({ tasks: list });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dataStore.init();
    const { user, errorResponse } = await authenticateRequest(request, ["SUPER_USER", "GM"]);
    if (errorResponse) return errorResponse;

    const body: any = await request.json();
    const { title, description, assignedTo, priority = "MEDIUM", dueDate } = body;

    if (!title || !description || !assignedTo || !dueDate) {
      return NextResponse.json(
        { error: "Judul, deskripsi, karyawan penanggung jawab, dan tenggat waktu wajib diisi" },
        { status: 400 }
      );
    }

    const employee = dataStore.users.find((u) => u.id === assignedTo);
    if (!employee) {
      return NextResponse.json({ error: "Karyawan penerima tugas tidak ditemukan" }, { status: 404 });
    }

    const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json({ error: "Prioritas tidak valid" }, { status: 400 });
    }

    const newTask: TaskItem = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      description: description.trim(),
      assignedBy: user!.userId,
      assignedByName: user!.name,
      assignedTo: employee.id,
      assignedToName: employee.name,
      assignedToDivision: employee.division,
      priority,
      status: "PENDING",
      dueDate,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    dataStore.tasks.unshift(newTask);

    dataStore.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: user!.userId,
      action: "TASK_CREATED",
      details: `GM membuat tugas '${newTask.title}' untuk ${employee.name}`,
      createdAt: Date.now(),
    });

    try {
      await syncTaskCreateToD1({
        title: newTask.title,
        description: newTask.description,
        assignedByNik: user!.nik,
        assignedToNik: employee.nik,
        priority: newTask.priority,
        status: newTask.status,
        dueDate: newTask.dueDate,
      });
    } catch (_) {}

    return NextResponse.json({ success: true, task: newTask }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
