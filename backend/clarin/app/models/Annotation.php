<?php

class Annotation extends Moloquent {
	protected $connection = 'mongodb';
	protected $collection = 'annotations';
	protected $fillable = array('_id', 'document_id', 'collection_id', 'owner_id', 'type', 'spans', 'attributes');
}
