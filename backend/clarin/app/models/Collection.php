<?php

class Collection extends Eloquent {
	protected $table = 'collections';
	protected $fillable = array('name', 'encoding', 'owner_id', 'handler'); 
}