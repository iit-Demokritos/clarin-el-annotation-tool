<?php

class OpenDocument extends Eloquent {
	protected $table = 'open_documents';
	protected $fillable = ['user_id', 'collection_id', 'document_id', 'annotator_type']; 
}