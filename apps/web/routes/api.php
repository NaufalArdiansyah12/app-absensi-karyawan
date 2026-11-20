<?php

use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LeaveController;
use App\Http\Controllers\Api\MasterController;
use App\Http\Controllers\Api\PayrollController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

// Auth Routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);
Route::get('/auth/me', [AuthController::class, 'me']);

// Attendance Routes
Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']);
Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut']);
Route::get('/attendance/history', [AttendanceController::class, 'history']);
Route::patch('/attendance/history', [AttendanceController::class, 'patchHistory']);

// Leave Routes
Route::get('/leaves/pending', [LeaveController::class, 'pending']);
Route::get('/leaves/my-leaves', [LeaveController::class, 'myLeaves']);
Route::post('/leaves/apply', [LeaveController::class, 'apply']);
Route::match(['post', 'patch'], '/leaves/{id}/approve-gm', [LeaveController::class, 'approveGm']);
Route::match(['post', 'patch'], '/leaves/{id}/approve-hr', [LeaveController::class, 'approveHr']);

// Master Routes
Route::get('/master/users', [MasterController::class, 'users']);
Route::patch('/master/users', [MasterController::class, 'patchUser']);
Route::get('/master/shifts', [MasterController::class, 'shifts']);
Route::patch('/master/shifts', [MasterController::class, 'updateShift']);
Route::get('/master/offices', [MasterController::class, 'offices']);
Route::patch('/master/offices', [MasterController::class, 'updateOffice']);
Route::get('/master/audit-logs', [MasterController::class, 'auditLogs']);

// Payroll Routes
Route::get('/payroll/slip', [PayrollController::class, 'slip']);
Route::post('/payroll/generate', [PayrollController::class, 'generate']);

// Task Routes
Route::get('/tasks', [TaskController::class, 'index']);
Route::post('/tasks', [TaskController::class, 'store']);
Route::patch('/tasks/{id}', [TaskController::class, 'update']);
Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
