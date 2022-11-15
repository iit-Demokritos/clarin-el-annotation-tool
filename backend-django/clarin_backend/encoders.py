from django.core.serializers.json import DjangoJSONEncoder
from django.db.models.fields.files import ImageFieldFile, FieldFile

class ExtendedJSONEncoder(DjangoJSONEncoder):
    def default(self, o):
        if isinstance(o, ImageFieldFile) or isinstance(o, FieldFile):
            if o and hasattr(o, 'url'):
                return o.url
            else:
                return None
        else:
            return super().default(o)

