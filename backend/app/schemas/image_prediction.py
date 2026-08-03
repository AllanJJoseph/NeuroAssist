from pydantic import BaseModel, ConfigDict, Field


class ImagePredictionResponse(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            'example': {
                'prediction': 'Bleeding',
                'confidence': 0.99,
                'heatmapPath': '/tmp/neuroassist_heatmap_example.png',
            }
        },
    )

    prediction: str
    confidence: float
    heatmap_path: str = Field(alias='heatmapPath')
