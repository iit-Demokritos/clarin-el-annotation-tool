<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSharedCollectionsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('shared_collections', function(Blueprint $table)
		{
			$table->increments('id')->unsigned();
			$table->integer('collection_id')->unsigned();
	        $table->string('from')->nullable();
	        $table->string('to')->nullable();
            $table->string('confirmation_code')->nullable();
            $table->boolean('confirmed')->default(0);
            $table->timestamps();
	        $table->foreign('collection_id')
			      ->references('id')
			      ->on('collections')
			      ->onDelete('cascade');
			$table->foreign('from')
			      ->references('email')
			      ->on('users');
			$table->foreign('to')
			      ->references('email')
			      ->on('users');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('shared_collections');
	}

}
