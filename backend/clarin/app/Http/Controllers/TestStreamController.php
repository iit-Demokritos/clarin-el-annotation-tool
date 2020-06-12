<?php

//namespace App\Http\Controllers;

use App\Message;
use Carbon\Carbon;

class TestStreamController extends Controller
{
    /**
     * The stream source.
     *
     * @return \Illuminate\Http\Response
     */
    public function test()
    {
        return response()->stream(function () {
	    $count = 0;
            while (true) {
                if (connection_aborted()) {
                    break;
		}
		//ob_start();
		echo("event: ping\n");
		echo("data: [{\"username\": \"John123\", \"emotion\": \"happy\", \"count\": $count}]\n\n");
		$count += 1;
                flush();
                sleep(1);
            }
        }, 200, [
            'Cache-Control' => 'no-cache',
            'Content-Type'  => 'text/event-stream',
        ]);
    }
}
