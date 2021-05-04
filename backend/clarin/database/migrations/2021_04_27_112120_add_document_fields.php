<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDocumentFields extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->string('type', 128)->nullable($value = true)->collation('utf8_unicode_ci')->after('name');
	    $table->longText('data_text')->nullable($value = true)->collation('utf8_unicode_ci')->after('text');
	    $table->binary('data_binary')->nullable($value = true)->after('data_text');
            $table->string('handler', 256)->nullable($value = true)->collation('utf8_unicode_ci')->after('data_binary');
	    $table->json('visualisation_options')->nullable($value = true)->collation('utf8_unicode_ci')->after('handler');
	    $table->json('metadata')->nullable($value = true)->collation('utf8_unicode_ci')->after('visualisation_options');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn('type');
	    $table->dropColumn('data_text');
	    $table->dropColumn('data_binary');
            $table->dropColumn('handler');
	    $table->dropColumn('visualisation_options');
	    $table->dropColumn('metadata');
        });
    }
}
