<?php

//use Jenssegers\Eloquent\Model as Eloquent;
//use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class Document extends Eloquent {
    protected $table = 'documents';
    protected $fillable = array('name', 'text', 'collection_id', 'external_name', 'encoding', 'owner_id', 'updated_by');

    public function temp_annotations() {
        return $this->hasMany('TempAnnotation');
    }

    public function annotations() {
        return $this->hasMany('Annotation');
    }
}
