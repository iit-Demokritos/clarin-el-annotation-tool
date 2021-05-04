<?php

class SharedCollection extends Eloquent {
	protected $table = 'shared_collections';
	protected $fillable = ['collection_id', 'from', 'to', 'confirmation_code']; 
}