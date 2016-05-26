<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateDocumentsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('documents', function(Blueprint $table)
		{
			$table->increments('id')->unsigned();
            $table->string('name');
            $table->text('text');
            $table->string('external_name');
            $table->string('encoding', 10);
            $table->integer('version')->default(1);
            $table->integer('owner_id')->unsigned();
            $table->integer('collection_id')->unsigned();
			$table->string('updated_by');
			$table->timestamps();
			$table->foreign('owner_id')
			      ->references('id')
			      ->on('users')
			      ->onDelete('cascade');
			$table->foreign('collection_id')
			      ->references('id')
			      ->on('collections')
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
		Schema::drop('documents');
	}

}
