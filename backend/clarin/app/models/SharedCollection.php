<?php

class SharedCollection extends Eloquent {
	protected $table = 'shared_collections';
	protected $fillable = array('collection_id', 'from', 'to', 'confirmation_code'); 
}