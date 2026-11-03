import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function generateAIVideoScript(businessName, product, style = "Modern premium") {
  const sanitizedName = businessName.trim();
  const sanitizedProduct = product.trim();

  const styleGuides = {
    "Modern premium": {
      mood: "Sleek, high-contrast, orchestral ambient beat with crisp transitions",
      lighting: "Soft studio rim lighting with deep shadows",
      pacing: "Fast cuts opening into smooth 60fps slow-motion reveals",
      colorGrade: "Teal and amber industrial tones"
    },
    "Industrial documentary": {
      mood: "Authentic, raw, powerful mechanical sound effects with driving percussion",
      lighting: "Natural factory sunlight through tall windows, glowing sparks and metal reflections",
      pacing: "Deliberate, grounded, heavy-machinery cadence",
      colorGrade: "Desaturated steel gray with vibrant heat accents"
    },
    "Energetic social ad": {
      mood: "Fast, upbeat Punjabi trap / synth rhythm with high energy",
      lighting: "Vibrant neon highlights and bright commercial daylight",
      pacing: "Quick 1.5-second jump cuts with dynamic zoom-ins",
      colorGrade: "Vivid, saturated, high-contrast mobile-optimized"
    },
    "Minimal product showcase": {
      mood: "Elegant, minimalist lo-fi acoustic texture",
      lighting: "Clean diffused white cyclorama studio lighting",
      pacing: "Graceful 360-degree turntable pan and macro texture inspection",
      colorGrade: "Neutral, clean, museum-quality color rendering"
    }
  };

  const currentStyle = styleGuides[style] || styleGuides["Modern premium"];

  const scenes = [
    {
      sceneNumber: 1,
      timestamp: "0:00 - 0:05",
      title: "The Industrial Hook",
      visualPrompt: `Ultra-photorealistic 4K cinematic opening shot of ${sanitizedProduct} in production. ${currentStyle.lighting}. Camera starts on extreme macro texture then pulls out rapidly. High-end commercial style, Punjab industrial aesthetic.`,
      cameraMovement: "Rapid macro zoom-out into sweeping wide angle",
      voiceover: `Built with precision. Engineered for resilience. Welcome to the new standard from ${sanitizedName}.`
    },
    {
      sceneNumber: 2,
      timestamp: "0:05 - 0:14",
      title: "Craftsmanship & Engineering",
      visualPrompt: `Skilled technicians and automated machinery perfecting ${sanitizedProduct} inside a state-of-the-art facility. ${currentStyle.colorGrade}. Sparks, precision calibration, and genuine artisanal focus.`,
      cameraMovement: "Smooth robotic dolly tracking shot along production line",
      voiceover: `Every unit of our ${sanitizedProduct} represents decades of Punjabi industrial expertise, modern testing, and uncompromising quality.`
    },
    {
      sceneNumber: 3,
      timestamp: "0:14 - 0:22",
      title: "Performance & Application",
      visualPrompt: `Dynamic real-world action shot of ${sanitizedProduct} in operation. Flawless execution, high durability, and stunning aesthetic appeal. Commercial depth of field with shallow focus.`,
      cameraMovement: "360-degree orbit shot around the active product",
      voiceover: `Designed to perform under demanding conditions — delivering consistency you can rely on day after day.`
    },
    {
      sceneNumber: 4,
      timestamp: "0:22 - 0:30",
      title: "Call to Action & Brand Reveal",
      visualPrompt: `Clean final title card with the ${sanitizedName} logo and PunjabHub AI badge against a minimalist frosted glass industrial background. ${currentStyle.lighting}.`,
      cameraMovement: "Subtle slow-motion drift to center",
      voiceover: `Connect directly with ${sanitizedName} on PunjabHub AI. Explore our complete catalog today.`
    }
  ];

  const tagProduct = sanitizedProduct.replace(/[^a-zA-Z0-9]/g, "");
  const tagBusiness = sanitizedName.replace(/[^a-zA-Z0-9]/g, "");

  return {
    id: "vid_" + Date.now().toString(36),
    businessName: sanitizedName,
    product: sanitizedProduct,
    style,
    aspectRatio: "9:16 (Optimized for Reels & Shorts) & 16:9 (Landscape)",
    duration: "30 Seconds",
    styleGuide: currentStyle,
    suggestedAudioTrack: {
      genre: style === "Energetic social ad" ? "Punjabi Modern Fusion / Trap Beat" : "Modern Cinematic Ambient",
      tempo: style === "Energetic social ad" ? "128 BPM" : "95 BPM",
      mood: currentStyle.mood
    },
    scenes,
    hashtags: [
      `#${tagBusiness}`,
      `#${tagProduct}`,
      "#PunjabHubAI",
      "#MadeInPunjab",
      "#IndianManufacturing",
      "#PunjabIndustry",
      "#VocalForLocal"
    ],
    fullVoiceoverScript: scenes.map((s) => s.voiceover).join(" "),
    generatedAt: new Date().toISOString()
  };
}

// Generate AI marketing video storyboard & production script
router.post(
  "/video",
  requireAuth,
  async (req, res, next) => {
    try {
      const { businessName, product, style } = req.body;

      if (
        typeof businessName !== "string" ||
        !businessName.trim() ||
        typeof product !== "string" ||
        !product.trim()
      ) {
        return res.status(400).json({
          message: "Business name and product are required."
        });
      }

      const concept = generateAIVideoScript(
        businessName,
        product,
        style || "Modern premium"
      );

      res.json({
        success: true,
        message: `AI video storyboard for ${businessName.trim()} created successfully!`,
        concept
      });
    } catch (error) {
      next(error);
    }
  }
);

// Prepare & schedule Instagram campaign
router.post(
  "/instagram/publish",
  requireAuth,
  async (req, res, next) => {
    try {
      const { businessName, product, caption, mediaUrl } = req.body;

      const title = businessName || "PunjabHub Partner";
      const item = product || "Industrial Catalog";

      const defaultCaption = caption ||
        `Proudly manufactured in Punjab. 🏭 Discover ${item} by ${title}.\n\n` +
        `Built with precision, engineered for endurance. Inquire directly or explore our full product range on PunjabHub AI.\n\n` +
        `#PunjabHubAI #MadeInPunjab #Manufacturing #${title.replace(/\s+/g, "")} #${item.replace(/\s+/g, "")}`;

      const postDraft = {
        id: "ig_" + Date.now().toString(36),
        platform: "Instagram (Reels / Feed)",
        account: `@${title.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
        caption: defaultCaption,
        mediaUrl: mediaUrl || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
        aspectRatio: "9:16 (Reels recommended)",
        status: "draft_prepared",
        scheduledTime: new Date(Date.now() + 3600000).toISOString(),
        metaGraphStatus: "Ready for direct webhook deployment with Meta Business Suite token."
      };

      res.json({
        success: true,
        message: "Instagram campaign package created and ready for review.",
        draft: postDraft
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
