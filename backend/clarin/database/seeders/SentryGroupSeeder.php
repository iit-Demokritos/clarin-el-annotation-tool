<?php
namespace Database\Seeders;
use Illuminate\Support\Facades\DB;


class SentryGroupSeeder extends Seeder {

	/**
	 * Run the database seeds.
	 *
	 * @return void
	 */
	public function run()
	{
		DB::table('groups')->delete();

		Sentry::getGroupProvider()->create([
	        'name'        => 'Users',
	        'permissions' => [
	            'admin' => 0,
	            'users' => 1,
	        ]]);

		Sentry::getGroupProvider()->create([
	        'name'        => 'Admins',
	        'permissions' => [
	            'admin' => 1,
	            'users' => 1,
	        ]]);
	}

}