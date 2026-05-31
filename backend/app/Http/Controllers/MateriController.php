<?php

namespace App\Http\Controllers;

use App\Models\Materi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MateriController extends Controller
{
    public function index(Request $request)
    {
        $materi = Materi::where('user_id', $request->user()->id)
                    ->orderBy('created_at', 'desc')
                    ->get();
                    
        return response()->json($materi);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf|max:20480', // max 20MB
            'title' => 'required|string|max:255',
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());
            
            $filePath = $file->storeAs('materi', $fileName, 'public');

            $materi = Materi::create([
                'user_id' => $request->user()->id,
                'title' => $request->title,
                'file_path' => $filePath,
                'metadata' => [
                    'size' => $file->getSize(),
                    'original_name' => $file->getClientOriginalName(),
                ]
            ]);

            return response()->json([
                'message' => 'Materi berhasil diunggah',
                'data' => $materi
            ], 201);
        }

        return response()->json(['message' => 'Gagal mengunggah file'], 400);
    }

    public function destroy(Request $request, $id)
    {
        $materi = Materi::where('id', $id)->where('user_id', $request->user()->id)->first();
        
        if (!$materi) {
            return response()->json(['message' => 'Materi tidak ditemukan'], 404);
        }

        if (Storage::disk('public')->exists($materi->file_path)) {
            Storage::disk('public')->delete($materi->file_path);
        }

        $materi->delete();

        return response()->json(['message' => 'Materi berhasil dihapus']);
    }
}
