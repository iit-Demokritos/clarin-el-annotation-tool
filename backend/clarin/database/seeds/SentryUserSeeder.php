<?php

class SentryUserSeeder extends Seeder {

	/**
	 * Run the database seeds.
	 *
	 * @return void
	 */
	public function run()
	{
	    DB::table('users')->delete();

	    Sentry::getUserProvider()->create([
	        'email'    => 'admin@admin.com',
	        'password' => 'admin',
	        'activated' => 1,
	    ]);

	    Sentry::getUserProvider()->create([
	        'email'    => 'imktks@gmail.com',
	        'password' => 'user',
	        'activated' => 1,
	    ]);
	}

}
