from django.db import models

class Premise(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    image = models.URLField(blank=True, null=True)
    price = models.CharField(max_length=50)
    available = models.IntegerField(default=0)
    total = models.IntegerField(default=0)
    features = models.JSONField(default=list, blank=True)
    rating = models.FloatField(default=0)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name
