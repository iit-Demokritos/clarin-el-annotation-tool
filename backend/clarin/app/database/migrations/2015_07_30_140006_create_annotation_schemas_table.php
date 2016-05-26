<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAnnotationSchemasTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('annotation_schemas', function(Blueprint $table)
		{
			$table->increments('id')->unsigned();
            $table->text('xml');
            $table->string('language');
	        $table->string('annotation_type')->nullable();
	        $table->string('attribute');
	        $table->string('alternative');
            $table->integer('owner_id')->unsigned();
			$table->timestamps();
			$table->foreign('owner_id')
			      ->references('id')
			      ->on('users')
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
		Schema::drop('annotation_schemas');
	}

}
