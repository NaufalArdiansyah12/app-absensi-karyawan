<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Karyawan;
use App\Models\Penugasan;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class TaskController extends Controller
{
    private function resolveAuthUser(Request $request): ?User
    {
        $user = $request->user();
        if ($user) {
            return $user;
        }
        if (Auth::check()) {
            return Auth::user();
        }
        $cookieToken = $request->cookie('nutrilife_session');
        if ($cookieToken) {
            $tokenModel = PersonalAccessToken::findToken($cookieToken);
            if ($tokenModel) {
                return $tokenModel->tokenable;
            }
        }

        return null;
    }

    public function index(): JsonResponse
    {
        $tasks = Penugasan::with(['pembuat', 'penerima'])->orderBy('id', 'desc')->get()->map(function ($t) {
            return [
                'id' => (string) $t->id,
                'title' => $t->judul,
                'description' => $t->deskripsi,
                'assignedBy' => (string) $t->dibuat_oleh,
                'assignedByName' => $t->pembuat?->name ?? 'GM',
                'assignedTo' => (string) ($t->penerima?->id_user ?? $t->ditugaskan_ke),
                'assignedToName' => $t->penerima?->nama_lengkap ?? 'Karyawan',
                'priority' => $t->prioritas,
                'status' => $t->status,
                'deadline' => $t->tenggat_waktu,
                'completionNote' => $t->catatan_penyelesaian,
                'revisionNote' => $t->catatan_revisi,
                'createdAt' => $t->created_at?->timestamp * 1000 ?? time() * 1000,
            ];
        });

        return response()->json(['tasks' => $tasks]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $this->resolveAuthUser($request);
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'assignedTo' => 'required',
            'deadline' => 'required|string',
        ]);

        $assignedToId = $request->input('assignedTo');
        $targetKaryawan = Karyawan::where('id_user', $assignedToId)->first() ?? Karyawan::find($assignedToId);
        if (! $targetKaryawan) {
            return response()->json(['error' => 'Karyawan penerima tugas tidak ditemukan'], 404);
        }

        $task = Penugasan::create([
            'judul' => $request->input('title'),
            'deskripsi' => $request->input('description'),
            'dibuat_oleh' => $user->id,
            'ditugaskan_ke' => $targetKaryawan->id,
            'prioritas' => $request->input('priority', 'SEDANG'),
            'status' => 'PENDING',
            'tenggat_waktu' => $request->input('deadline'),
        ]);

        return response()->json([
            'message' => 'Penugasan berhasil dibuat',
            'task' => [
                'id' => (string) $task->id,
                'title' => $task->judul,
                'description' => $task->deskripsi,
                'assignedBy' => (string) $user->id,
                'assignedByName' => $user->name,
                'assignedTo' => (string) $targetKaryawan->id_user,
                'assignedToName' => $targetKaryawan->nama_lengkap,
                'priority' => $task->prioritas,
                'status' => $task->status,
                'deadline' => $task->tenggat_waktu,
                'createdAt' => $task->created_at?->timestamp * 1000 ?? time() * 1000,
            ],
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $task = Penugasan::with('penerima')->find($id);
        if (! $task) {
            return response()->json(['error' => 'Tugas tidak ditemukan'], 404);
        }

        $fields = [];
        if ($request->has('title')) {
            $fields['judul'] = $request->input('title');
        }
        if ($request->has('description')) {
            $fields['deskripsi'] = $request->input('description');
        }
        if ($request->has('priority')) {
            $fields['prioritas'] = $request->input('priority');
        }
        if ($request->has('status')) {
            $fields['status'] = $request->input('status');
        }
        if ($request->has('deadline')) {
            $fields['tenggat_waktu'] = $request->input('deadline');
        }
        if ($request->has('completionNote')) {
            $fields['catatan_penyelesaian'] = $request->input('completionNote');
        }
        if ($request->has('revisionNote')) {
            $fields['catatan_revisi'] = $request->input('revisionNote');
        }

        $task->update($fields);

        return response()->json([
            'message' => 'Status tugas berhasil diperbarui',
            'task' => $task,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $task = Penugasan::find($id);
        if (! $task) {
            return response()->json(['error' => 'Tugas tidak ditemukan'], 404);
        }

        $task->delete();

        return response()->json(['message' => 'Tugas berhasil dihapus']);
    }
}
