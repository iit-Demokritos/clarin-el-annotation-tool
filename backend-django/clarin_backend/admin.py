from django.contrib import admin

#Register your models here.
#from django.contrib import admin
from .models import Users, Collections, Documents


# class CustomUserAdmin(admin.ModelAdmin):
#     model = Users

# admin.site.register(Users, CustomUserAdmin)
# admin.site.register(Collections)
# admin.site.register(Documents)