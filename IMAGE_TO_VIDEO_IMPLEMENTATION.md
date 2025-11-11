# Image-to-Video Implementation Guide

## Overview
This document describes the complete image-to-video implementation for both Veo 3.1 and Sora 2 models in the React Native Expo Template.

## ✅ Test Results
All image-to-video functionality has been tested and verified:
- ✅ Veo 3.1 with single image
- ✅ Veo 3.1 with two images (frame transition)
- ✅ Sora 2 image-to-video

## Veo 3.1 Implementation

### Features
Veo 3.1 supports flexible image-to-video generation with two modes:

1. **Single Image Mode**: Video unfolds around the provided image with dynamic presentation
2. **Two Images Mode**: First image becomes the first frame, second image becomes the last frame, with smooth transition between them

### API Details

**Endpoint**: `POST /api/v1/veo/generate`

**Request Structure**:
```typescript
{
  prompt: string;                          // Description of desired video
  model: 'veo3_fast' | 'veo3';            // Model variant
  imageUrls: string[];                     // 1 or 2 image URLs
  generationType: 'FIRST_AND_LAST_FRAMES_2_VIDEO';  // Required for image-to-video
  aspectRatio: '16:9' | '9:16' | 'Auto'; // Video aspect ratio
  enableTranslation: boolean;              // Auto-translate prompts to English
  seeds?: number;                          // Optional: 10000-99999 for reproducibility
  watermark?: string;                      // Optional: watermark text
  callBackUrl?: string;                    // Optional: webhook for completion
}
```

**Generation Types**:
- `TEXT_2_VIDEO`: Text-only generation (no images)
- `FIRST_AND_LAST_FRAMES_2_VIDEO`: Image-to-video (1-2 images)
- `REFERENCE_2_VIDEO`: Reference-based generation (veo3_fast only, 16:9 only)

**Response Structure**:
```typescript
{
  code: 200,
  msg: "success",
  data: {
    taskId: string  // Use this to poll for completion
  }
}
```

**Status Check**: `GET /api/v1/veo/record-info?taskId={taskId}`

**Status Response**:
```typescript
{
  code: 200,
  data: {
    taskId: string;
    successFlag: number;  // 0=Generating, 1=Success, 2=Failed, 3=Generation Failed
    response: {
      resultUrls: string[];   // Completed video URLs
      originUrls: string[];   // Fallback URLs
      resolution: string;     // e.g., "720p"
    } | null;
    errorMessage: string | null;
  }
}
```

### Implementation Example

```typescript
// Single image
const response = await api.post('/veo/generate', {
  prompt: 'Camera slowly zooms into the scene with dramatic lighting',
  model: 'veo3_fast',
  imageUrls: ['https://example.com/image.jpg'],
  generationType: 'FIRST_AND_LAST_FRAMES_2_VIDEO',
  aspectRatio: '16:9',
  enableTranslation: true,
});

// Two images (frame transition)
const response = await api.post('/veo/generate', {
  prompt: 'Smooth transition from first frame to last frame',
  model: 'veo3_fast',
  imageUrls: [
    'https://example.com/first-frame.jpg',
    'https://example.com/last-frame.jpg'
  ],
  generationType: 'FIRST_AND_LAST_FRAMES_2_VIDEO',
  aspectRatio: '16:9',
  enableTranslation: true,
});
```

## Sora 2 Implementation

### Features
Sora 2 provides high-quality image-to-video generation with:
- Portrait (9:16) and Landscape (16:9) support
- 10s or 15s duration options
- Automatic watermark removal
- Premium quality output

### API Details

**Endpoint**: `POST /api/v1/jobs/createTask`

**Request Structure**:
```typescript
{
  model: 'sora-2-image-to-video';  // Use this specific model for image-to-video
  input: {
    prompt: string;                // Description of desired video motion/action
    image_urls: string[];          // Array of image URLs (typically 1 image)
    aspect_ratio: 'portrait' | 'landscape';  // Maps to 9:16 or 16:9
    n_frames: '10' | '15';         // Video duration in seconds
    remove_watermark: boolean;     // Remove Sora watermark
  };
  callBackUrl?: string;            // Optional: webhook for completion
}
```

**Response Structure**:
```typescript
{
  code: 200,
  msg: "success",
  data: {
    taskId: string  // Use this to poll for completion
  }
}
```

**Status Check**: `GET /api/v1/jobs/recordInfo?taskId={taskId}`

**Status Response**:
```typescript
{
  code: 200,
  data: {
    taskId: string;
    state: 'waiting' | 'queuing' | 'generating' | 'success' | 'fail';
    resultJson: string;  // JSON string containing video URLs when complete
    failMsg: string;     // Error message if state is 'fail'
  }
}
```

**Parsing resultJson** (when state === 'success'):
```typescript
const resultData = JSON.parse(data.resultJson);
const videoUrl = resultData.resultUrls?.[0] || resultData.resultWaterMarkUrls?.[0];
```

### Implementation Example

```typescript
const response = await api.post('/jobs/createTask', {
  model: 'sora-2-image-to-video',
  input: {
    prompt: 'Camera pans across the scene with cinematic movement',
    image_urls: ['https://example.com/image.jpg'],
    aspect_ratio: 'portrait',  // or 'landscape'
    n_frames: '10',            // or '15'
    remove_watermark: true,
  },
});
```

## Service Implementation (kieai.service.ts)

The service automatically handles both models:

```typescript
// Generic method that routes to correct implementation
async generateVideo(params: VideoGenerationRequest): Promise<GenerateResponse> {
  if (params.model === 'VEO 3.1') {
    // Automatically sets generationType based on imageUrls presence
    const hasImages = params.imageUrls && params.imageUrls.length > 0;
    const generationType = hasImages
      ? 'FIRST_AND_LAST_FRAMES_2_VIDEO'
      : 'TEXT_2_VIDEO';

    return this.generateVeoVideo({
      prompt: params.prompt,
      model: 'veo3_fast',
      imageUrls: params.imageUrls,
      aspectRatio: params.aspectRatio,
      generationType,
      callBackUrl: params.callBackUrl,
    });
  }
  else if (params.model === 'Sora 2') {
    const hasImages = params.imageUrls && params.imageUrls.length > 0;
    const soraModel = hasImages ? 'sora-2-image-to-video' : 'sora-2-text-to-video';

    // Map aspectRatio
    const aspectRatioMapping = {
      '9:16': 'portrait',
      '16:9': 'landscape',
    };
    const aspect_ratio = aspectRatioMapping[params.aspectRatio || '16:9'] || 'landscape';

    return this.generateSoraVideo({
      model: soraModel,
      callBackUrl: params.callBackUrl,
      input: {
        prompt: params.prompt,
        image_urls: hasImages ? params.imageUrls : undefined,
        aspect_ratio,
        n_frames: params.duration || '10',
        remove_watermark: true,
      },
    });
  }
}
```

## Usage in React Native

```typescript
import { useKieAI } from '../hooks/useKieAI';

function VideoGenerationScreen() {
  const { generateVideo, loading, videoUrl } = useKieAI();

  // Veo 3.1 with single image
  await generateVideo({
    prompt: 'Camera zooms in dramatically',
    model: 'VEO 3.1',
    imageUrls: ['https://example.com/image.jpg'],
    aspectRatio: '16:9',
  });

  // Veo 3.1 with two images
  await generateVideo({
    prompt: 'Smooth transition between scenes',
    model: 'VEO 3.1',
    imageUrls: [
      'https://example.com/first.jpg',
      'https://example.com/last.jpg'
    ],
    aspectRatio: '16:9',
  });

  // Sora 2 with image
  await generateVideo({
    prompt: 'Cinematic camera movement',
    model: 'Sora 2',
    imageUrls: ['https://example.com/image.jpg'],
    aspectRatio: '9:16',
    duration: '10',
  });
}
```

## Key Differences Between Models

| Feature | Veo 3.1 | Sora 2 |
|---------|---------|--------|
| **Endpoint** | `/veo/generate` | `/jobs/createTask` |
| **Status Check** | `/veo/record-info` | `/jobs/recordInfo` |
| **Model Name** | `veo3_fast` or `veo3` | `sora-2-image-to-video` |
| **Image Parameter** | `imageUrls` (array) | `input.image_urls` (array) |
| **Aspect Ratio** | `'16:9'` or `'9:16'` | `'landscape'` or `'portrait'` |
| **Duration** | Fixed 8s | `'10'` or `'15'` seconds |
| **Generation Type** | Explicit (`generationType`) | Implicit (via model name) |
| **Multi-Image** | ✅ Yes (1-2 images) | ⚠️ Typically 1 image |
| **Status Values** | `successFlag`: 0,1,2,3 | `state`: waiting/generating/success/fail |
| **Video URL Location** | `response.resultUrls[0]` | Parse `resultJson` |

## Testing

Run the comprehensive test suite:
```bash
node test-image-to-video.js
```

This will test:
1. Veo 3.1 with single image
2. Veo 3.1 with two images (frame transition)
3. Sora 2 image-to-video

## Troubleshooting

### Common Issues

**1. Veo 3.1 fails without generationType**
- **Solution**: Always set `generationType: 'FIRST_AND_LAST_FRAMES_2_VIDEO'` when using images

**2. Sora 2 wrong model name**
- **Solution**: Use `sora-2-image-to-video`, not `sora-2-text-to-video` when images are provided

**3. Image URLs not accessible**
- **Solution**: Ensure images are publicly accessible. The API server must be able to download them.

**4. Aspect ratio mismatch**
- **Solution**:
  - Veo 3.1: Use `'16:9'` or `'9:16'`
  - Sora 2: Use `'landscape'` or `'portrait'`

**5. Response parsing errors**
- **Solution**:
  - Veo 3.1: Access `response.resultUrls` directly (it's already an object)
  - Sora 2: Parse `resultJson` with `JSON.parse()` first

## Performance Notes

- **Veo 3.1**: Average generation time 70-85 seconds
- **Sora 2**: Average generation time 120-140 seconds
- Both models support polling every 5 seconds
- Use webhooks (`callBackUrl`) for production to avoid constant polling

## Credits & Pricing

Refer to [https://kie.ai/billing](https://kie.ai/billing) for current pricing:
- Veo 3.1: ~$0.40 per 8-second video
- Sora 2: Higher quality, premium pricing
- Image-to-video typically costs the same as text-to-video

## Support

For issues or questions:
- Email: [email protected]
- Documentation: https://docs.kie.ai
- Dashboard: Your KIE.AI account dashboard
