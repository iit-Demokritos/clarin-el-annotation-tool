<?php

class OpenDocument extends Eloquent {
	protected $table = 'open_documents';
	protected $fillable = array('user_id', 'collection_id', 'document_id', 'annotator_type'); 
}