from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

# import pyeuropeana.apis as apis

class EuropeanaSearchView(APIView):
    permission_classes = (AllowAny,)

    def str2bool(self, v):
        if v is None: return v
        return v.lower() in ('y', 'yes', 't', 'true', 'on', '1')

    def get(self, request):
        kwargs = request.query_params
        params = {
            'query':         kwargs.get('query','*'), 
            'qf':            kwargs.get('qf'),
            'reusability':   kwargs.get('reusability'),
            'media':         self.str2bool(kwargs.get('media')),
            'thumbnail':     self.str2bool(kwargs.get('thumbnail')),
            'landingpage':   self.str2bool(kwargs.get('landingpage')),
            'colourpalette': kwargs.get('colourpalette'),
            'theme':         kwargs.get('theme'),
            'sort':          kwargs.get('sort','europeana_id'),
            'profile':       kwargs.get('profile'),
            'rows':          int(kwargs.get('rows',12)),
            'cursor':        kwargs.get('cursor','*'),
            'callback':      kwargs.get('callback'),   
            'facet':         kwargs.get('facet'),
        }

        if 'query' not in request.query_params:
            return Response(data={"success": False, "message": "query missng"}, status=status.HTTP_400_BAD_REQUEST)
        ## Prepare the query dict...
        print(params)
        # data = apis.search(**params)
        data = {}
        return Response(
            data={"success": True, "data": data},
            status=status.HTTP_200_OK
        )
