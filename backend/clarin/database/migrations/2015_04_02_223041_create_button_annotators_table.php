<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateButtonAnnotatorsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('button_annotators', function(Blueprint $table)
		{
			$table->integer('user_id')->unsigned();
	        $table->string('language')->nullable();
	        $table->string('annotation_type')->nullable();
	        $table->string('attribute')->nullable();
	        $table->string('alternative')->nullable();
	        $table->timestamps();
	        $table->foreign('user_id')
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
		Schema::drop('button_annotators');
	}

}
