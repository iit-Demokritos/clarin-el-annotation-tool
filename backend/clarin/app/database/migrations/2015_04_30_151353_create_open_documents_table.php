<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateOpenDocumentsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('open_documents', function(Blueprint $table)
		{
			$table->integer('user_id')->unsigned();
			$table->integer('collection_id')->unsigned();
			$table->integer('document_id')->unsigned();
	        $table->string('annotator_type');
	        $table->integer('db_interactions')->unsigned();
	        $table->timestamps();
	        $table->primary('user_id');
	        $table->foreign('user_id')
			      ->references('id')
			      ->on('users')
			      ->onDelete('cascade');
			$table->foreign('collection_id')
				  ->references('id')
				  ->on('collections')
				  ->onDelete('cascade');
			$table->foreign('document_id')
				  ->references('id')
				  ->on('documents')
				  ->onDelete('cascade');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('open_documents');
	}

}
