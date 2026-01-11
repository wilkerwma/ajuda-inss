<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('mongodb')->create('cid10_codes', function (Blueprint $collection) {
            $collection->string('cid_code')->unique();
            $collection->string('name');
            $collection->text('plain_text_description');
            $collection->string('bpc_eligibility');
            $collection->text('legal_notes')->nullable();
            $collection->json('embedding')->nullable();
            $collection->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('cid10_codes');
    }
};
