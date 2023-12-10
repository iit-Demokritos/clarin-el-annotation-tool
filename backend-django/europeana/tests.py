from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
import os
os.environ['EUROPEANA_API_KEY'] = 'ssnerawlim'
import json

class EuropeanaSearchTests(APITestCase):
    def test_search(self):
        """
        Ensure we can perform a search request.
        """
        url = reverse('europeana-search')
        data = {
            'query': 'Sophocles Antigone',
            'qf': 'TYPE:IMAGE',
            'media': True,
            'thumbnail': True,
            'profile': 'minimal',
            'rows': 12,
        }
        print(url)
        response = self.client.get(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        for item in data['data']['items']:
            print(json.dumps(item))
            break
        # print(response.json())
