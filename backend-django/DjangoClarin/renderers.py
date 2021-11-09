from rest_framework.renderers import BaseRenderer

class TextEventStreamAPIRenderer(BaseRenderer):
    media_type = 'text/event-stream'
    charset = None
    encoder_class = None
    format = 'text/event-stream'

    def render(self, data, media_type=None, renderer_context=None):
        print(data,type(data))
        if isinstance(data, str):
            return data.encode('utf-8')
        return data
