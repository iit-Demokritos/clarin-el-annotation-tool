<?php

//use Jenssegers\Eloquent\Model as Eloquent;
//use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class Document extends Eloquent {
    protected $table = 'documents';
    protected $fillable = array('name', 'text', 'collection_id', 'external_name', 'encoding', 'owner_id', 'updated_by', 'type', 'data_text', 'data_binary', 'handler', 'visualisation_options', 'metadata');

    public function temp_annotations() {
        return $this->hasMany('TempAnnotation');
    }

    public function annotations() {
        return $this->hasMany('Annotation');
    }
}
