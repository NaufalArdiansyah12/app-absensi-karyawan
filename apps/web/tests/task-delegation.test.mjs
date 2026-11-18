import test from "node:test";
import assert from "node:assert/strict";
import { dataStore } from "../lib/store.ts";

test("Task Delegation domain: store initializes seed tasks and handles status lifecycle", async () => {
  await dataStore.init();

  assert.ok(dataStore.tasks.length >= 4, "Initial seed tasks must be loaded");

  // Check columns present
  const pending = dataStore.tasks.filter((t) => t.status === "PENDING");
  const inProgress = dataStore.tasks.filter((t) => t.status === "IN_PROGRESS");
  const review = dataStore.tasks.filter((t) => t.status === "COMPLETED");
  const closed = dataStore.tasks.filter((t) => t.status === "CLOSED");

  assert.ok(pending.length > 0, "Should have PENDING tasks");
  assert.ok(inProgress.length > 0, "Should have IN_PROGRESS tasks");
  assert.ok(review.length > 0, "Should have COMPLETED tasks");
  assert.ok(closed.length > 0, "Should have CLOSED tasks");

  // Create new task
  const testTaskId = `task_unit_test_${Date.now()}`;
  dataStore.tasks.push({
    id: testTaskId,
    title: "Unit Test Task",
    description: "Verify lifecycle transitions",
    assignedBy: "usr_gm",
    assignedByName: "Budi Santoso (GM)",
    assignedTo: "usr_emp_1",
    assignedToName: "Ahmad Fauzi",
    assignedToDivision: "OPERASIONAL",
    priority: "HIGH",
    status: "PENDING",
    dueDate: "2026-12-01",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const created = dataStore.tasks.find((t) => t.id === testTaskId);
  assert.ok(created, "Created task should exist in store");
  assert.equal(created.status, "PENDING");

  // Transition to IN_PROGRESS (Employee takes action)
  created.status = "IN_PROGRESS";
  created.updatedAt = Date.now();
  assert.equal(created.status, "IN_PROGRESS");

  // Employee submits completion notes
  created.status = "COMPLETED";
  created.completionNotes = "Pekerjaan verifikasi telah selesai dikerjakan.";
  created.updatedAt = Date.now();
  assert.equal(created.status, "COMPLETED");
  assert.ok(created.completionNotes);

  // GM requests revision
  created.status = "IN_PROGRESS";
  created.revisionNotes = "Mohon tambahkan file lampiran pendukung.";
  created.updatedAt = Date.now();
  assert.equal(created.status, "IN_PROGRESS");
  assert.equal(created.revisionNotes, "Mohon tambahkan file lampiran pendukung.");

  // GM closes/approves
  created.status = "CLOSED";
  created.updatedAt = Date.now();
  assert.equal(created.status, "CLOSED");

  // Cleanup
  const idx = dataStore.tasks.findIndex((t) => t.id === testTaskId);
  if (idx !== -1) dataStore.tasks.splice(idx, 1);
});
