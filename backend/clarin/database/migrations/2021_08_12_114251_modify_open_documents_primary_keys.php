<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ModifyOpenDocumentsPrimaryKeys extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
      Schema::table('open_documents', function (Blueprint $table) {
        //   $table->index('user_id');
        $table->foreign('user_id')->references('id')->on('users');
        $table->dropPrimary('user_id');
      });
      Schema::table('open_documents', function (Blueprint $table) {
        $table->id();
        $table->unique(['user_id', 'collection_id', 'document_id', 'annotator_type'], 'open_documents_user_id_collection_id_document_id_ann_type_unique');
      });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
