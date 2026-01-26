<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ClearSessionController extends Controller
{
    public function __invoke(Request $request): \Illuminate\View\View
    {
        // Invalidate the current session so a NEW session_id is generated.
        // This ensures MessageController::index() will use a fresh
        // session ID, and therefore return no previous messages.
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return view('clear-session');
    }
}

                    