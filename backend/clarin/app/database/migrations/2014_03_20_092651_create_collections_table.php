<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCollectionsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('collections', function(Blueprint $table)
		{
			$table->increments('id')->unsigned();
		    $table->string('name');
		    $table->integer('owner_id')->unsigned();
		    $table->string('encoding');
		    $table->string('handler');
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
		Schema::drop('collections');
	}

}
