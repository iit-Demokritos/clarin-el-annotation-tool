<?php

class Collection extends Eloquent {
	protected $table = 'collections';
	protected $fillable = ['name', 'encoding', 'owner_id', 'handler']; 
}