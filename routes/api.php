<?php

use App\Plugins\MapSync\Controllers\EntityTypeController;
use Illuminate\Support\Facades\Route;


Route::middleware(['before' => 'jwt.auth', 'after' => 'jwt.refresh'])->group(function () {
    Route::get('/entity-types', [EntityTypeController::class, 'list']);

    Route::post('/sync/{entityType}/{attribute}', [EntityTypeController::class, 'sync']);
});