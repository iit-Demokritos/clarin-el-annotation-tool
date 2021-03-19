<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ChangeDocumentTextType extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->mediumText('text')->collation('utf8_unicode_ci')->change();
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
            $table->text('text')->collation('utf8_unicode_ci')->change();
        });
    }
}
